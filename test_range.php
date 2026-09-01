<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::find(2);
auth()->login($user);

$req = Illuminate\Http\Request::create('/api/transactions?month=2026-09', 'GET');
$req->setUserResolver(function() use ($user) { return $user; });

$ctrl = new App\Http\Controllers\Api\TransactionController();
$range = $ctrl->getDateRange($req);

echo "Start: " . $range[0]->toDateTimeString() . "\n";
echo "End: " . $range[1]->toDateTimeString() . "\n";

// Test the query
$query = $user->transactions();
$query->whereDate('date', '>=', $range[0]);
$query->whereDate('date', '<=', $range[1]);

echo "SQL: " . $query->toSql() . "\n";
echo "Bindings: " . json_encode($query->getBindings()) . "\n";
echo "Count: " . $query->count() . "\n";
