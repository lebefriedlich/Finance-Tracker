<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithCharts;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Layout;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;

class SummarySheetExport implements FromCollection, WithTitle, WithCharts, WithStyles, ShouldAutoSize
{
    protected $budgetProgress;
    protected $totalBalance;
    protected $monthlyIncome;
    protected $monthlyExpense;

    public function __construct($budgetProgress, $totalBalance, $monthlyIncome, $monthlyExpense)
    {
        $this->budgetProgress = $budgetProgress;
        $this->totalBalance = $totalBalance;
        $this->monthlyIncome = $monthlyIncome;
        $this->monthlyExpense = $monthlyExpense;
    }

    public function collection()
    {
        $data = [
            ['Total Pemasukan Bulan Ini', $this->monthlyIncome],
            ['Total Pengeluaran Bulan Ini', $this->monthlyExpense],
            ['Saldo Total (Keseluruhan)', $this->totalBalance],
            ['', ''],
            ['Kategori', 'Anggaran (Rp)', 'Terpakai (Rp)', 'Sisa (Rp)', 'Status'],
        ];

        foreach ($this->budgetProgress as $bp) {
            $sisa = $bp['budget'] - $bp['spent'];
            $statusStr = '';
            switch ($bp['status']) {
                case 'ok': $statusStr = 'Aman'; break;
                case 'warning': $statusStr = 'Hampir Habis'; break;
                case 'empty': $statusStr = 'Habis'; break;
                case 'over': $statusStr = 'Bocor'; break;
                case 'nobudget': $statusStr = 'Tanpa Anggaran'; $sisa = 0; break;
            }

            $data[] = [
                $bp['name'],
                $bp['budget'],
                $bp['spent'],
                $sisa,
                $statusStr
            ];
        }

        return new Collection($data);
    }

    public function title(): string
    {
        return 'Ringkasan';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
            2 => ['font' => ['bold' => true]],
            3 => ['font' => ['bold' => true]],
            5 => ['font' => ['bold' => true]],
        ];
    }

    public function charts()
    {
        if (count($this->budgetProgress) == 0) {
            return [];
        }

        $rowCount = count($this->budgetProgress) + 5; 

        $label      = [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, 'Ringkasan!$C$5', null, 1)]; 
        $categories = [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, 'Ringkasan!$A$6:$A$' . $rowCount, null, count($this->budgetProgress))];
        $values     = [new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, 'Ringkasan!$C$6:$C$' . $rowCount, null, count($this->budgetProgress))];

        $series = new DataSeries(
            DataSeries::TYPE_PIECHART,      
            null,  
            range(0, count($values) - 1),   
            $label,                         
            $categories,                    
            $values                         
        );

        $layout = new Layout();
        $layout->setShowVal(true);
        $layout->setShowPercent(true);

        $plotArea = new PlotArea($layout, [$series]);
        $legend = new Legend(Legend::POSITION_RIGHT, null, false);
        $title = new Title('Proporsi Pengeluaran per Kategori');

        $chart = new Chart(
            'chart1', 
            $title,   
            $legend,  
            $plotArea, 
            true,     
            0,        
            null,     
            null      
        );

        $chart->setTopLeftPosition('G2');
        $chart->setBottomRightPosition('N20');

        return $chart;
    }
}
