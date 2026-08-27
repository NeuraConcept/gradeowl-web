"use client";

import {
  Users,
  FileText,
  Upload,
  CheckCircle,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import {
  useAdminDashboard,
  useAdminWaitlist,
  useAdminUsers,
} from "@/lib/api/hooks/use-admin";
import type { ExamStatus } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useCurrentOrganization } from "@/components/organization-provider";

// --- Stat card ---

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  loading: boolean;
}

function StatCard({ label, value, icon: Icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warm-yellow">
            <Icon className="h-5 w-5 text-coral" />
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-7 w-16 rounded" />
            ) : (
              <p className="text-2xl font-bold">{value ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Exams by status ---

const STATUS_ORDER: ExamStatus[] = [
  "DRAFT",
  "RUBRIC_REVIEW",
  "GRADING",
  "CLUSTERING",
  "COMPLETE",
  "GRADING_FAILED",
];

function ExamsByStatus({
  data,
  loading,
}: {
  data: Record<string, number> | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded" />
        ))}
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No exam data yet.
      </p>
    );
  }

  const total = Object.values(data).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-3">
      {STATUS_ORDER.map((status) => {
        const count = data[status] ?? 0;
        if (count === 0) return null;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={status} className="flex items-center gap-3">
            <div className="w-28 shrink-0">
              <StatusBadge status={status} />
            </div>
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-coral transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className="w-8 text-right text-sm font-medium">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- Recent exams table ---

function RecentExamsTable({
  exams,
  loading,
}: {
  exams:
    | Array<{
        id: number;
        title: string;
        subject: string;
        class_name: string;
        status: string;
        teacher_name: string;
        created_at: string;
      }>
    | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded" />
        ))}
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No exams created yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Title</TableHead>
            <TableHead className="text-xs">Subject</TableHead>
            <TableHead className="text-xs">Class</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">Teacher</TableHead>
            <TableHead className="text-xs">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium text-sm">
                {exam.title}
              </TableCell>
              <TableCell className="text-sm">{exam.subject}</TableCell>
              <TableCell className="text-sm">{exam.class_name}</TableCell>
              <TableCell>
                <StatusBadge status={exam.status as ExamStatus} />
              </TableCell>
              <TableCell className="text-sm">{exam.teacher_name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(exam.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// --- Waitlist table ---

function WaitlistTable() {
  const { data: waitlist, isLoading, isError } = useAdminWaitlist();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage message="Failed to load waitlist data." />;
  }

  if (!waitlist || waitlist.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No waitlist entries yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Name</TableHead>
            <TableHead className="text-xs">School</TableHead>
            <TableHead className="text-xs">Phone</TableHead>
            <TableHead className="text-xs">Board</TableHead>
            <TableHead className="text-xs">Subjects</TableHead>
            <TableHead className="text-xs">Signed Up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {waitlist.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium text-sm">
                {entry.name}
              </TableCell>
              <TableCell className="text-sm">{entry.school}</TableCell>
              <TableCell className="text-sm">{entry.phone}</TableCell>
              <TableCell className="text-sm">{entry.board}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {entry.subjects ?? "-"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(entry.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// --- Teachers table ---

function TeachersTable() {
  const { data: users, isLoading, isError } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage message="Failed to load teacher data." />;
  }

  if (!users || users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No teachers registered yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Name</TableHead>
            <TableHead className="text-xs">Firebase UID</TableHead>
            <TableHead className="text-xs">Joined</TableHead>
            <TableHead className="text-xs text-right">Exams</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-sm">
                {user.full_name}
              </TableCell>
              <TableCell className="text-sm font-mono text-muted-foreground">
                {user.firebase_uid.slice(0, 12)}...
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-sm font-medium text-right">
                {user.exam_count}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// --- Error message ---

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

// --- Main page ---

export default function AdminPage() {
  const { data: organization } = useCurrentOrganization();
  if (organization?.role !== "ADMIN") {
    return (
      <Card className="mx-auto mt-16 max-w-xl">
        <CardContent className="space-y-3 pt-6">
          <h1 className="text-2xl font-bold">School admins only</h1>
          <p className="text-muted-foreground">
            Only a school administrator can manage school settings and staff.
          </p>
          <Link className="text-coral underline" href="/">
            Return to exams
          </Link>
        </CardContent>
      </Card>
    );
  }
  return <AdminDashboard />;
}

function AdminDashboard() {
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError: dashboardError,
  } = useAdminDashboard();
  const { data: waitlist } = useAdminWaitlist();
  const { data: users } = useAdminUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {dashboardError && (
        <ErrorMessage message="Failed to load dashboard data. You may not have admin permissions." />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Total Teachers"
          value={dashboard?.total_users}
          icon={Users}
          loading={dashboardLoading}
        />
        <StatCard
          label="Total Exams"
          value={dashboard?.total_exams}
          icon={FileText}
          loading={dashboardLoading}
        />
        <StatCard
          label="Total Submissions"
          value={dashboard?.total_submissions}
          icon={Upload}
          loading={dashboardLoading}
        />
        <StatCard
          label="Graded"
          value={dashboard?.total_graded}
          icon={CheckCircle}
          loading={dashboardLoading}
        />
        <StatCard
          label="Waitlist Signups"
          value={dashboard?.waitlist_count}
          icon={UserPlus}
          loading={dashboardLoading}
        />
      </div>

      {/* Middle: Status breakdown + Recent exams */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-4">
            <h2 className="mb-4 text-base font-semibold">Exams by Status</h2>
            <ExamsByStatus
              data={dashboard?.exams_by_status}
              loading={dashboardLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h2 className="mb-4 text-base font-semibold">Recent Exams</h2>
            <RecentExamsTable
              exams={dashboard?.recent_exams}
              loading={dashboardLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Tabs for Waitlist + Teachers */}
      <Tabs defaultValue="waitlist">
        <TabsList>
          <TabsTrigger value="waitlist">
            Waitlist{waitlist ? ` (${waitlist.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="teachers">
            Teachers{users ? ` (${users.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist" className="mt-4">
          <WaitlistTable />
        </TabsContent>

        <TabsContent value="teachers" className="mt-4">
          <TeachersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
