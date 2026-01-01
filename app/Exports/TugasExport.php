<?php

namespace App\Exports;

use App\Models\Tugas;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class TugasExport implements 
    FromCollection, 
    WithHeadings, 
    WithStyles, 
    WithColumnWidths,
    WithTitle,
    ShouldAutoSize
{
    protected $tugasId;
    protected $userId;

    public function __construct($tugasId, $userId)
    {
        $this->tugasId = $tugasId;
        $this->userId = $userId;
    }

    public function collection()
    {
        $tugas = Tugas::where('id', $this->tugasId)
            ->where('id_guru', $this->userId)
            ->with(['penugasan.siswa:id,name,username,telepon,kelas,jurusan'])
            ->first();

        if (!$tugas) {
            return collect([]);
        }

        return $tugas->penugasan->map(function ($penugasan, $index) {
            return [
                'no' => $index + 1,
                'id_siswa' => $penugasan->siswa->id,
                'username' => $penugasan->siswa->username,
                'nama' => $penugasan->siswa->name,
                'telepon' => $penugasan->siswa->telepon,
                'kelas' => $penugasan->siswa->kelas,
                'jurusan' => $penugasan->siswa->jurusan,
                'status' => ucfirst($penugasan->status),
                'link_drive' => $penugasan->link_drive ?? '-',
                'tanggal' => $penugasan->tanggal_pengumpulan 
                    ? date('d/m/Y H:i', strtotime($penugasan->tanggal_pengumpulan)) 
                    : '-',
                'nilai' => $penugasan->nilai ?? '-',
                'catatan' => $penugasan->catatan_guru ?? '-',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'ID Siswa',
            'Username',
            'Nama Siswa',
            'Telepon',
            'Kelas',
            'Jurusan',
            'Status',
            'Link Drive',
            'Tanggal Pengumpulan',
            'Nilai',
            'Catatan Guru',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        // Style header
        $sheet->getStyle('A1:' . $lastColumn . '1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4472C4'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        // Style untuk semua data
        if ($lastRow > 1) {
            $sheet->getStyle('A2:' . $lastColumn . $lastRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Zebra striping untuk baris genap
            for ($i = 2; $i <= $lastRow; $i++) {
                if ($i % 2 == 0) {
                    $sheet->getStyle('A' . $i . ':' . $lastColumn . $i)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F2F2F2'],
                        ],
                    ]);
                }
            }

            // Center alignment untuk kolom tertentu
            $sheet->getStyle('A2:A' . $lastRow)->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('B2:B' . $lastRow)->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('F2:F' . $lastRow)->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('G2:G' . $lastRow)->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('H2:H' . $lastRow)->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('K2:K' . $lastRow)->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        // Set tinggi baris header
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Wrap text untuk kolom catatan dan link
        $sheet->getStyle('I2:I' . $lastRow)->getAlignment()->setWrapText(true);
        $sheet->getStyle('L2:L' . $lastRow)->getAlignment()->setWrapText(true);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,   // No
            'B' => 10,  // ID Siswa
            'C' => 15,  // Username
            'D' => 25,  // Nama
            'E' => 15,  // Telepon
            'F' => 10,  // Kelas
            'G' => 15,  // Jurusan
            'H' => 12,  // Status
            'I' => 35,  // Link Drive
            'J' => 20,  // Tanggal
            'K' => 8,   // Nilai
            'L' => 30,  // Catatan
        ];
    }

    public function title(): string
    {
        return 'Data Tugas Siswa';
    }
}