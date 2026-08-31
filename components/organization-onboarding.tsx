"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { apiClient, getApiErrorMessage } from "@/lib/api/client";
import type { Organization } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrganizationOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [schoolName, setSchoolName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const complete = async () => {
    await queryClient.invalidateQueries({ queryKey: ["organization"] });
    router.replace("/");
  };

  const createSchool = useMutation({
    mutationFn: () =>
      apiClient.post<Organization>("/orgs", { name: schoolName.trim() }),
    onSuccess: complete,
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to create school")),
  });
  const joinSchool = useMutation({
    mutationFn: () =>
      apiClient.post<Organization>("/orgs/join", { join_code: joinCode.trim() }),
    onSuccess: complete,
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to join school")),
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
      <div className="w-full space-y-3">
        <p className="text-sm font-medium text-coral">Welcome to GradeOwl</p>
        <h1 className="text-3xl font-bold">Set up your school workspace</h1>
        <p className="max-w-2xl text-muted-foreground">
          To create and review exams, join your school with a code or create its workspace.
        </p>
        <div className="grid gap-6 pt-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Building2 className="h-6 w-6 text-coral" />
              <CardTitle>Create your school</CardTitle>
              <CardDescription>
                You will become the school administrator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!schoolName.trim()) return toast.error("Enter your school name");
                  createSchool.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="school-name">School name</Label>
                  <Input
                    id="school-name"
                    value={schoolName}
                    onChange={(event) => setSchoolName(event.target.value)}
                    placeholder="Greenwood School"
                  />
                </div>
                <Button className="w-full" type="submit" disabled={createSchool.isPending}>
                  {createSchool.isPending ? "Creating..." : "Create school"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <KeyRound className="h-6 w-6 text-coral" />
              <CardTitle>Join your school</CardTitle>
              <CardDescription>
                Ask a school administrator for the join code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!joinCode.trim()) return toast.error("Enter a join code");
                  joinSchool.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="join-code">Join code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(event) => setJoinCode(event.target.value)}
                    placeholder="Enter school join code"
                  />
                </div>
                <Button className="w-full" type="submit" disabled={joinSchool.isPending}>
                  {joinSchool.isPending ? "Joining..." : "Join school"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
