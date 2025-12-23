<?php

namespace App\Http\Controllers;

use App\Models\Tugas;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GeminiController extends Controller
{
    /**
     * System prompt untuk AI Artemis
     */
    private function getSystemPrompt(): string
    {
        return <<<PROMPT
Kamu adalah Artemis, asisten AI cerdas untuk sistem pendidikan ArtemisSMEA.
Tugasmu adalah membantu siswa memahami materi dan tugas yang diberikan guru.

Prinsip-prinsip yang harus kamu ikuti:
1. Jelaskan dengan bahasa yang mudah dipahami siswa Indonesia
2. Gunakan pendekatan interaktif - ajukan pertanyaan balik untuk memastikan pemahaman
3. Berikan contoh relevan dan analogi yang mudah dimengerti
4. JANGAN memberikan jawaban langsung untuk tugas, tapi bimbing siswa menemukan jawabannya sendiri
5. Motivasi dan apresiasi usaha siswa
6. Jika siswa bertanya di luar konteks pembelajaran, arahkan kembali ke topik pendidikan dengan sopan
7. Gunakan emoji secukupnya untuk membuat percakapan lebih ramah 😊

Ingat: Tujuanmu adalah membuat siswa MENGERTI, bukan sekedar memberikan jawaban.
PROMPT;
    }
    public function chat(Request $request)
    {
        // validasi input
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:2000',
            'id_tugas' => 'nullable|integer|exists:tugas,id',
        ], [
            'message.required' => 'Pesan tidak boleh kosong',
            'message.max' => 'Pesan maksimal 2000 karakter',
            'id_tugas.exists' => 'Tugas tidak ditemukan',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $userMessage = $request->input('message');
            $idTugas = $request->input('id_tugas');

            // build konteks
            $contextMessage = $this->buildContextMessage($userMessage, $idTugas);

            // post ke gemini api dengan system instruction
            $result = Gemini::generativeModel(model: 'gemini-2.5-flash')
                ->startChat(history: [
                    \Gemini\Data\Content::parse(part: $this->getSystemPrompt(), role: \Gemini\Enums\Role::USER),
                    \Gemini\Data\Content::parse(part: 'Baik, saya siap membantu siswa ArtemisSMEA dengan pendekatan pembelajaran interaktif!', role: \Gemini\Enums\Role::MODEL),
                ])
                ->sendMessage($contextMessage);

            $aiResponse = $result->text();

            return response()->json([
                'success' => true,
                'data' => [
                    'response' => $aiResponse,
                    'context' => $idTugas ? 'tugas' : 'general',
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses permintaan',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    private function buildContextMessage(string $userMessage, ?int $idTugas): string
    {
        if (!$idTugas) {
            return $userMessage;
        }

        // ambil detail tugas
        $tugas = Tugas::with('guru')->find($idTugas);

        if (!$tugas) {
            return $userMessage;
        }

        $context = "\n\n[KONTEKS TUGAS]\n";
        $context .= "Judul: {$tugas->judul}\n";
        $context .= "Deskripsi: {$tugas->deskripsi}\n";
        $context .= "Guru: {$tugas->guru->nama}\n";
        $context .= "Tipe Pengumpulan: {$tugas->tipe_pengumpulan}\n";
        $context .= "Deadline: {$tugas->tanggal_deadline->format('d M Y H:i')}\n";
        $context .= "[/KONTEKS TUGAS]\n\n";
        $context .= "Pertanyaan siswa: {$userMessage}";

        return $context;
    }
}
