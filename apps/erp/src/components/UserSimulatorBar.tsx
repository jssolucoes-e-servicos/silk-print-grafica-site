import React from 'react';
import { UserCheck, Shield, Key, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { UserEmployee, AccessProfile } from '../types';

interface UserSimulatorBarProps {
  employees: UserEmployee[];
  profiles: AccessProfile[];
  activeUser: UserEmployee;
  onSelectUser: (user: UserEmployee) => void;
}

export const UserSimulatorBar: React.FC<UserSimulatorBarProps> = ({
  employees,
  profiles,
  activeUser,
  onSelectUser,
}) => {
  const activeProfiles = profiles.filter((p) => activeUser.profileIds?.includes(p.id));
  const activeGrants = activeUser.customPermissions || [];

  return (
    <div className="bg-zinc-950/90 border-b border-blue-900/40 px-3 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center gap-2 text-zinc-300">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
          <Eye className="w-3 h-3" />
          <span>MODO SIMULAÇÃO DE ACESSO</span>
        </div>
        <span className="text-zinc-500 hidden sm:inline">•</span>
        <span className="text-[11px] text-zinc-400 hidden sm:inline">
          Navegando como:
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* User Selector Dropdown */}
        <div className="flex items-center gap-1.5">
          <select
            value={activeUser.id}
            onChange={(e) => {
              const target = employees.find((emp) => emp.id === e.target.value);
              if (target) onSelectUser(target);
            }}
            className="px-2.5 py-1 text-[11px] font-bold bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-xs"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.jobTitle})
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Profiles Badges */}
        <div className="hidden md:flex items-center gap-1">
          {activeProfiles.map((p) => (
            <span
              key={p.id}
              className="px-1.5 py-0.5 text-[9px] font-bold rounded border shadow-2xs text-white"
              style={{
                backgroundColor: `${p.color}25`,
                borderColor: `${p.color}60`,
                color: p.color,
              }}
            >
              {p.name}
            </span>
          ))}
        </div>

        {/* Custom Grants Indicator */}
        {activeGrants.length > 0 && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Key className="w-2.5 h-2.5" />
            {activeGrants.length} avulsa(s)
          </span>
        )}
      </div>
    </div>
  );
};
