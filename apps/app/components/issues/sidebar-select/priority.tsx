import React from "react";

// ui
import { CustomSelect } from "components/ui";
// icons
import { getPriorityIcon } from "components/icons/priority-icon";
// constants
import { PRIORITIES } from "constants/project";

type Props = {
  value: string | null;
  onChange: (val: string) => void;
  disabled?: boolean;
};

export const SidebarPrioritySelect: React.FC<Props> = ({ value, onChange, disabled = false }) => (
  <CustomSelect
    customButton={
      <button
        type="button"
        className={`flex items-center gap-1.5 text-left text-sm capitalize rounded px-2.5 py-0.5 ${
          value === "urgent"
            ? "border-red-500/20 bg-red-500/20 text-red-500"
            : value === "high"
            ? "border-orange-500/20 bg-orange-500/20 text-orange-500"
            : value === "medium"
            ? "border-yellow-500/20 bg-yellow-500/20 text-yellow-500"
            : value === "low"
            ? "border-green-500/20 bg-green-500/20 text-green-500"
            : "bg-custom-background-80 border-custom-border-200"
        }`}
      >
        <span className="grid place-items-center -my-1">
          {getPriorityIcon(value ?? "None", "!text-sm")}
        </span>
        <span>{value ?? "None"}</span>
      </button>
    }
    value={value}
    onChange={onChange}
    optionsClassName="w-min"
    disabled={disabled}
  >
    {PRIORITIES.map((option) => (
      <CustomSelect.Option key={option} value={option} className="capitalize">
        <>
          {getPriorityIcon(option, "text-sm")}
          {option ?? "None"}
        </>
      </CustomSelect.Option>
    ))}
  </CustomSelect>
);
