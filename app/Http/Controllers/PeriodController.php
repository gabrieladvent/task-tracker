<?php

namespace App\Http\Controllers;

use App\Http\Requests\PeriodeRequest;
use App\Models\Period;
use App\Services\PeriodServices;
use Inertia\Inertia;

class PeriodController extends Controller
{
    public function __construct(
        private PeriodServices $periodServices
    ) {}

    public function index(): \Inertia\Response
    {
        $periods = $this->periodServices->getPeriodsWithStats();

        return Inertia::render('Periods/Index', [
            'periods' => $periods,
        ]);
    }

    public function store(PeriodeRequest $request)
    {
        $period = Period::create($request->validated());

        return redirect()->route('periods.show', $period);
    }

    public function show(Period $period): \Inertia\Response
    {
        $data = $this->periodServices->getPeriodDetails($period);

        return Inertia::render('Periods/Show', $data);
    }

    public function update(PeriodeRequest $request, Period $period)
    {
        $period->update($request->validated());

        return back();
    }

    public function destroy(Period $period)
    {
        $period->delete();

        return redirect()->route('periods.index');
    }
}
