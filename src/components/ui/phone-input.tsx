"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

const COUNTRIES = [
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳" },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷" },
  { code: "JP", dial: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳" },
  { code: "SG", dial: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "AE", dial: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "NL", dial: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "IT", dial: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "ES", dial: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", dial: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "RU", dial: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "KR", dial: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "ID", dial: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", dial: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "TH", dial: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "MY", dial: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "VN", dial: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "PK", dial: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", dial: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "NP", dial: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "LK", dial: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "EG", dial: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "NZ", dial: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "IE", dial: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "SE", dial: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", dial: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", dial: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "BE", dial: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "PL", dial: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "PT", dial: "+351", name: "Portugal", flag: "🇵🇹" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: string;
  placeholder?: string;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "IN",
  placeholder = "Enter phone number",
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(
    COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0],
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCountrySelect = (country: (typeof COUNTRIES)[0]) => {
    setSelected(country);
    setIsOpen(false);
    setSearch("");
    // update full number with new dial code
    const numberOnly = value.replace(/^\+\d+\s*/, "");
    onChange(`${country.dial}${numberOnly}`);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^\d]/g, "");
    onChange(`${selected.dial}${input}`);
  };

  // extract number without dial code for display
  const displayNumber = value.startsWith(selected.dial)
    ? value.slice(selected.dial.length)
    : value.replace(/^\+\d+/, "");

  return (
    <div className="flex items-center gap-0 border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
      {/* country selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-2.5 hover:bg-muted/50 transition-colors border-r"
        >
          <span className="text-xl leading-none">{selected.flag}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-popover border rounded-lg shadow-lg z-[100] overflow-hidden">
            {/* search */}
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* country list */}
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No countries found
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left ${
                      selected.code === country.code ? "bg-muted" : ""
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-sm truncate">
                      {country.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {country.dial}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* dial code display */}
      <span className="text-sm text-muted-foreground pl-3 select-none">
        {selected.dial}
      </span>

      {/* number input */}
      <input
        ref={inputRef}
        type="tel"
        value={displayNumber}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="flex-1 px-2 py-2.5 bg-transparent outline-none text-sm"
      />
    </div>
  );
}
