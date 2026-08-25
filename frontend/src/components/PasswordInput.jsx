import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

import { useLanguage } from "../i18n/LanguageContext";

export default function PasswordInput({
  className = "",
  leadingIcon: LeadingIcon = LockKeyhole,
  ...inputProps
}) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const hasLeadingIcon = Boolean(LeadingIcon);

  return (
    <span className="relative block">
      {hasLeadingIcon && (
        <LeadingIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          size={19}
          aria-hidden="true"
        />
      )}
      <input
        {...inputProps}
        type={visible ? "text" : "password"}
        className={`${className} ${hasLeadingIcon ? "pl-12" : ""} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        title={visible ? t("hidePassword") : t("showPassword")}
        className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-on-surface-variant transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {visible ? <Eye size={19} aria-hidden="true" /> : <EyeOff size={19} aria-hidden="true" />}
      </button>
    </span>
  );
}
