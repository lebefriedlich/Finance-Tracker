<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class DashboardExport implements WithMultipleSheets
{
    use Exportable;

    protected $startDate;
    protected $endDate;
    protected $budgetProgress;
    protected $totalBalance;
    protected $monthlyIncome;
    protected $monthlyExpense;

    public function __construct($startDate, $endDate, $budgetProgress, $totalBalance, $monthlyIncome, $monthlyExpense)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->budgetProgress = $budgetProgress;
        $this->totalBalance = $totalBalance;
        $this->monthlyIncome = $monthlyIncome;
        $this->monthlyExpense = $monthlyExpense;
    }

    public function sheets(): array
    {
        return [
            new SummarySheetExport($this->budgetProgress, $this->totalBalance, $this->monthlyIncome, $this->monthlyExpense),
            new TransactionsExport($this->startDate, $this->endDate),
        ];
    }
}
