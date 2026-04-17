"use client";

import { useTransition } from "react";
import { toggleTaskAction } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/Button";

interface Props {
  id: string;
  done: boolean;
}

export function TaskToggleButton({ id, done }: Props) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={() => start(() => toggleTaskAction(id))}
    >
      {done ? "↺ Reabrir" : "✓ Completar"}
    </Button>
  );
}
