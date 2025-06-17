/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

interface InventoryAlertsProps {
  seller: any;
}

export function InventoryAlerts({ seller }: InventoryAlertsProps) {
  return (
    <div className="space-y-2">
      <div className="text-center py-8">
        <p className="text-xs text-light-500">No inventory alerts</p>
      </div>
    </div>
  );
}
