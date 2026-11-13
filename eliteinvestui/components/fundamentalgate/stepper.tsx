"use client";

import {
  ShieldCheck,
  CandlestickChart,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ValuationStep = 1 | 2 | 3;

type StepItem = {
  id: ValuationStep;
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

const steps: StepItem[] = [
  {
    id: 1,
    title: "Fundamental Evaluation",
    subtitle: "Quality, value, gates, conviction",
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: "Technical Gate",
    subtitle: "Timing and confluence",
    icon: CandlestickChart,
  },
  {
    id: 3,
    title: "Add To Basket",
    subtitle: "Review and basket handoff",
    icon: ShoppingBasket,
  },
];

interface ValuationDiscoveryStepperProps {
  activeStep: ValuationStep;
}

export function ValuationDiscoveryStepper({
  activeStep,
}: ValuationDiscoveryStepperProps) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;
          const isComplete = step.id < activeStep;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border p-4 transition-all ${
                isActive
                  ? "border-violet-200 bg-violet-50"
                  : isComplete
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-violet-100 text-violet-700"
                      : isComplete
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      Step {step.id}
                    </span>
                    {isActive && (
                      <Badge className="bg-violet-600 hover:bg-violet-600">
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {step.title}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    {step.subtitle}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}