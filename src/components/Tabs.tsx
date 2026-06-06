"use client";

import { useState, ReactNode } from "react";

export type TabId = "main" | "management" | "history" | "insights";

export interface TabDef {
  id: TabId;
  label: string;
  description?: string;
}

interface TabsProps {
  tabs: TabDef[];
  children: Partial<Record<TabId, ReactNode>>;
  defaultTab?: TabId;
}

export default function Tabs({ tabs, children, defaultTab }: TabsProps) {
  const [active, setActive] = useState<TabId>(defaultTab ?? tabs[0].id);

  return (
    <div>
      {/* Tab buttons */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children[active]}</div>
    </div>
  );
}
