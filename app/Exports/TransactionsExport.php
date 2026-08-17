<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Maatwebsite\Excel\Concerns\WithTitle;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle, WithColumnFormatting
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        $query = Transaction::with(['category', 'account'])->where('user_id', auth()->id());
        
        if ($this->startDate) {
            $query->whereDate('date', '>=', $this->startDate);
        }
        if ($this->endDate) {
            $query->whereDate('date', '<=', $this->endDate);
        }
        
        return $query->orderBy('date', 'desc')->get();
    }

    public function headings(): array
    {
            'Tanggal',
            'Tipe',
            'Kategori',
            'Sumber Dana',
            'Jumlah (Rp)',
            'Keterangan',
        ];
    }

    public function map($transaction): array
    {
            $transaction->date,
            $transaction->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            $transaction->category->name ?? '-',
            $transaction->account->name ?? '-',
            $transaction->amount,
            $transaction->description,
        ];
    }

    public function columnFormats(): array
    {
        return [
            'E' => '#,##0',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $rowCount = $sheet->getHighestRow();
        
        $sheet->getStyle('A1:F1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'color' => ['argb' => 'FF10B981'],
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFDDDDDD']],
            ],
        ]);

        if ($rowCount > 1) {
            $sheet->getStyle('A2:F' . $rowCount)->applyFromArray([
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFDDDDDD']],
                ],
            ]);
        }

        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Transaksi';
    }
}
