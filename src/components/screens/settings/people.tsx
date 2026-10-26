"use client";

/**
 * Settings → People & permissions (the redesign's settings-people.tsx): who uses Safety, with
 * what role and where. Users can be invited, have their role and locations changed, and be
 * deactivated; roles are listed with their reach; teams are not built yet.
 */

import { RdAsk, RdTable, RdToolbar, type RdColumn } from "@/components/redesign/table";
import { Muted, RdBadge, RdCard, RdEmptyState, RdNotice, RdSegmented, useTabParam } from "@/components/redesign/ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { locationName } from "@/lib/three-cases/data";
import { AREAS, COMPANY_DOMAIN, ROLES, USER_STATUS, roleName, type RoleId, type SettingsUser, type UserStatus } from "@/lib/screens/settings";
import { cn } from "@/lib/utils";
import { Check, Plus, UserPlus, Users2 } from "lucide-react";
import { useId, useState } from "react";
import { RowMenu, SettingsField, SettingsFormDialog, SettingsPane, SoonPrimary, selectClass, settingsButton } from "./shared";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEGMENTS = [
  { value: "users", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "teams", label: "Teams" },
] as const;
type Segment = (typeof SEGMENTS)[number]["value"];

const locationsLabel = (u: SettingsUser) =>
  u.allLocations ? "All locations" : u.locations.length === 0 ? null : `${locationName(u.locations[0])}${u.locations.length > 1 ? ` +${u.locations.length - 1} more` : ""}`;

// ───────────────────────────── invite / edit

interface Draft {
  first: string;
  last: string;
  email: string;
  roleId: RoleId | "";
  allLocations: boolean;
  locations: string[];
}

function UserDialog({ target, users, onClose, onSave }: { target: SettingsUser | "invite" | null; users: SettingsUser[]; onClose: () => void; onSave: (user: SettingsUser) => void }) {
  const ids = { first: useId(), last: useId(), email: useId(), role: useId() };
  const [draft, setDraft] = useState<Draft>({ first: "", last: "", email: "", roleId: "", allLocations: false, locations: [] });
  const [inviting, setInviting] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [openedFor, setOpenedFor] = useState<typeof target>(null);

  // Opening on a new target resets the form (state from props, without an effect); closing keeps
  // what is shown, so the dialog does not change while it fades out.
  if (target !== openedFor) {
    setOpenedFor(target);
    if (target) {
      setInviting(target === "invite");
      setShowErrors(false);
      setDraft(
        target === "invite"
          ? { first: "", last: "", email: "", roleId: "", allLocations: false, locations: [] }
          : { first: "", last: "", email: target.email, roleId: target.roleId, allLocations: target.allLocations, locations: target.locations },
      );
    }
  }

  const globalAdmin = draft.roleId === "global_admin";
  const everywhere = globalAdmin || draft.allLocations;
  const errors = {
    first: inviting && !draft.first.trim() ? "Add a first name." : null,
    last: inviting && !draft.last.trim() ? "Add a last name." : null,
    email: !inviting
      ? null
      : !EMAIL.test(draft.email.trim())
        ? "Enter a valid email address."
        : users.some((u) => u.email.toLowerCase() === draft.email.trim().toLowerCase())
          ? "Someone with this email is already here."
          : null,
    role: !draft.roleId ? "Choose a role." : null,
    locations: !everywhere && draft.locations.length === 0 ? "Pick at least one location, or all of them." : null,
  };

  const submit = () => {
    setShowErrors(true);
    if (Object.values(errors).some(Boolean) || !draft.roleId) return;
    const base = { roleId: draft.roleId, allLocations: everywhere, locations: everywhere ? [] : draft.locations };
    if (inviting) {
      const name = `${draft.first.trim()} ${draft.last.trim()}`;
      onSave({ id: `local-${Date.now().toString(36)}`, name, email: draft.email.trim(), jobTitle: "", status: "pending", ...base });
    } else if (target && target !== "invite") {
      onSave({ ...target, ...base });
    }
  };

  const toggleArea = (id: string, on: boolean) => setDraft((d) => ({ ...d, locations: on ? [...d.locations, id] : d.locations.filter((x) => x !== id) }));

  return (
    <SettingsFormDialog
      open={target !== null}
      onOpenChange={(next) => !next && onClose()}
      title={inviting ? "Invite user" : "Edit user"}
      description={inviting ? "They get an email to join Safety with this role." : "Change the user’s role and where they work."}
      submitLabel={inviting ? "Invite" : "Save changes"}
      onSubmit={submit}
    >
      {inviting ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="First name" htmlFor={ids.first} error={showErrors ? errors.first : null}>
              <Input id={ids.first} value={draft.first} onChange={(e) => setDraft({ ...draft, first: e.target.value })} aria-invalid={(showErrors && Boolean(errors.first)) || undefined} />
            </SettingsField>
            <SettingsField label="Last name" htmlFor={ids.last} error={showErrors ? errors.last : null}>
              <Input id={ids.last} value={draft.last} onChange={(e) => setDraft({ ...draft, last: e.target.value })} aria-invalid={(showErrors && Boolean(errors.last)) || undefined} />
            </SettingsField>
          </div>
          <SettingsField label="Email" htmlFor={ids.email} error={showErrors ? errors.email : null}>
            <Input id={ids.email} type="email" value={draft.email} placeholder={`name@${COMPANY_DOMAIN}`} onChange={(e) => setDraft({ ...draft, email: e.target.value })} aria-invalid={(showErrors && Boolean(errors.email)) || undefined} />
          </SettingsField>
        </>
      ) : (
        <SettingsField label="Email" hint="Changing an email means inviting the person again.">
          <Input value={draft.email} disabled />
        </SettingsField>
      )}
      <SettingsField label="Role" htmlFor={ids.role} error={showErrors ? errors.role : null}>
        <select id={ids.role} data-slot="input" className={selectClass} value={draft.roleId} onChange={(e) => setDraft({ ...draft, roleId: e.target.value as RoleId })} aria-invalid={(showErrors && Boolean(errors.role)) || undefined}>
          <option value="" disabled>
            Choose a role
          </option>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </SettingsField>
      <SettingsField label="Locations" hint={globalAdmin ? "A global admin always works at every location." : undefined} error={showErrors ? errors.locations : null}>
        <div className="flex flex-col gap-1 rounded-lg bg-muted p-2">
          <label className={cn("flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground", !globalAdmin && "cursor-pointer hover:bg-background")}>
            <Checkbox checked={everywhere} disabled={globalAdmin} onCheckedChange={(v) => setDraft({ ...draft, allLocations: v === true })} />
            All locations
          </label>
          <div className="grid gap-1 sm:grid-cols-2">
            {AREAS.map((a) => (
              <label key={a.id} className={cn("flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground", everywhere ? "opacity-50" : "cursor-pointer hover:bg-background")}>
                <Checkbox checked={everywhere || draft.locations.includes(a.id)} disabled={everywhere} onCheckedChange={(v) => toggleArea(a.id, v === true)} />
                {a.name}
              </label>
            ))}
          </div>
        </div>
      </SettingsField>
    </SettingsFormDialog>
  );
}

// ───────────────────────────── users

const STATUS_ORDER: UserStatus[] = ["active", "pending", "not_onboarded", "inactive"];

function UsersList({
  users,
  notice,
  onDismiss,
  onEdit,
  onInvite,
  onStatus,
}: {
  users: SettingsUser[];
  notice: string | null;
  onDismiss: () => void;
  onEdit: (u: SettingsUser) => void;
  onInvite: () => void;
  onStatus: (u: SettingsUser, s: UserStatus) => void;
}) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState("name");

  const words = q.trim().toLowerCase();
  const rows = users
    .filter((u) => !picked.length || picked.includes(u.status))
    .filter((u) => !words || `${u.name} ${u.email} ${u.jobTitle} ${roleName(u.roleId)}`.toLowerCase().includes(words))
    .sort((a, b) =>
      sort === "role"
        ? ROLES.findIndex((r) => r.id === a.roleId) - ROLES.findIndex((r) => r.id === b.roleId) || a.name.localeCompare(b.name)
        : sort === "status"
          ? STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
    );
  const count = (s: UserStatus) => users.filter((u) => u.status === s).length;

  const columns: RdColumn<SettingsUser>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{u.name}</p>
          <p className="truncate text-xs text-text-subtle">{u.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", width: "20%", render: (u) => <span className="block truncate">{roleName(u.roleId)}</span> },
    {
      key: "locations",
      header: "Locations",
      width: "22%",
      render: (u) => {
        const label = locationsLabel(u);
        return label ? (
          <span className="block truncate" title={u.allLocations ? undefined : u.locations.map(locationName).join(", ")}>
            {label}
          </span>
        ) : (
          <Muted>No locations</Muted>
        );
      },
    },
    { key: "status", header: "Status", width: "15%", render: (u) => <RdBadge tone={USER_STATUS[u.status].tone}>{USER_STATUS[u.status].label}</RdBadge> },
    {
      key: "menu",
      header: "",
      width: "64px",
      render: (u) => (
        <RowMenu
          label={u.name}
          items={[
            u.status === "not_onboarded" ? { key: "onboard", label: "Onboard user", soon: true } : { key: "edit", label: "Edit user", onSelect: () => onEdit(u) },
            ...(u.status === "pending" ? [{ key: "resend", label: "Resend invite", soon: true }] : []),
            ...(u.status === "active" || u.status === "pending" ? [{ key: "deactivate", label: "Deactivate", onSelect: () => onStatus(u, "inactive") }] : []),
            ...(u.status === "inactive" ? [{ key: "reactivate", label: "Reactivate", onSelect: () => onStatus(u, "active") }] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-2">
        <RdAsk value={q} onChange={setQ} placeholder="Search by name or email" />
        <RdToolbar
          filters={STATUS_ORDER.filter((s) => count(s) > 0).map((s) => ({ value: s, label: USER_STATUS[s].label, count: count(s) }))}
          selected={picked}
          onToggle={(v) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
          sorts={[
            { value: "name", label: "Name, A to Z" },
            { value: "role", label: "Role" },
            { value: "status", label: "Status" },
          ]}
          sort={sort}
          onSort={setSort}
        />
      </div>
      {notice ? (
        <RdNotice
          icon={Check}
          title={notice}
          action={
            <Button type="button" variant="ghost" size="sm" className={settingsButton} onClick={onDismiss}>
              Dismiss
            </Button>
          }
        />
      ) : null}
      {rows.length ? (
        <RdTable rows={rows} columns={columns} rowKey={(u) => u.id} onRow={(u) => u.status !== "not_onboarded" && onEdit(u)} />
      ) : (
        <RdEmptyState title="Nothing matches" body="Try other words, or clear the filters." />
      )}
      {users.length === 1 ? (
        <RdNotice
          icon={UserPlus}
          title="You are the only one here"
          action={
            <Button type="button" variant="outline" size="sm" className={settingsButton} onClick={onInvite}>
              Invite user
            </Button>
          }
        >
          Invite the people who report, review and fix things.
        </RdNotice>
      ) : (
        <p className="text-xs text-text-subtle">
          Showing {rows.length} of {users.length}
        </p>
      )}
    </div>
  );
}

// ───────────────────────────── roles

function Roles({ users }: { users: SettingsUser[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ROLES.map((role) => {
        const n = users.filter((u) => u.roleId === role.id && u.status !== "inactive").length;
        return (
          <RdCard key={role.id} className="h-full">
            <div className="flex h-full flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-base leading-6 font-semibold text-foreground">{role.name}</p>
                {role.system ? <RdBadge>System</RdBadge> : <RdBadge tone="accent">Custom</RdBadge>}
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>
              <p className="mt-auto pt-2 text-sm text-text-subtle">
                {n} {n === 1 ? "user" : "users"} · {role.permissions} permissions
              </p>
            </div>
          </RdCard>
        );
      })}
    </div>
  );
}

// ───────────────────────────── the tab

export function PeopleTab({ initialUsers, title, description }: { initialUsers: SettingsUser[]; title: string; description: string }) {
  const [segment, setSegment] = useTabParam(
    SEGMENTS.map((s) => s.value),
    "subtab",
  );
  const [users, setUsers] = useState(initialUsers);
  const [dialog, setDialog] = useState<SettingsUser | "invite" | null>(null);
  // The prototype has no toasts: the last change is confirmed in a quiet line above the list.
  const [notice, setNotice] = useState<string | null>(null);

  const save = (user: SettingsUser) => {
    const known = users.some((u) => u.id === user.id);
    setUsers((list) => (known ? list.map((u) => (u.id === user.id ? user : u)) : [user, ...list]));
    setDialog(null);
    const before = users.find((u) => u.id === user.id);
    setNotice(
      !known
        ? `${user.name} invited. They get an email to join Safety as ${roleName(user.roleId)}.`
        : before && before.status !== user.status
          ? `${user.name} ${user.status === "inactive" ? "deactivated" : "reactivated"}.`
          : `${user.name} updated.`,
    );
  };

  const action =
    segment === "users" ? (
      <Button type="button" size="sm" className={settingsButton} onClick={() => setDialog("invite")}>
        <Plus aria-hidden />
        Invite user
      </Button>
    ) : segment === "roles" ? (
      <SoonPrimary label="Create role" />
    ) : null;

  return (
    <SettingsPane title={title} description={description} action={action}>
      <RdSegmented<Segment> value={segment as Segment} options={[...SEGMENTS]} onChange={setSegment} className="w-fit" />
      {segment === "users" ? (
        <UsersList users={users} notice={notice} onDismiss={() => setNotice(null)} onEdit={setDialog} onInvite={() => setDialog("invite")} onStatus={(u, status) => save({ ...u, status })} />
      ) : segment === "roles" ? (
        <Roles users={users} />
      ) : (
        <RdEmptyState icon={Users2} title="Teams are coming" body="Group people into teams to assign and notify them together." />
      )}
      <UserDialog target={dialog} users={users} onClose={() => setDialog(null)} onSave={save} />
    </SettingsPane>
  );
}
