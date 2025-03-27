"use server";

import { z } from "zod";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getUserId, getUserName, getUserPassword } from "@/config";


const user = {
  id: await getUserId(),
  username: await getUserName(),
  password: await getUserPassword()
};


const loginSchema = z.object({
  username: z.string().trim(),
  password: z.string().trim(),
});

export async function login(_prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { username: username, password } = result.data;

  if (username !== user.username || password !== user.password) {
    return {
      errors: {
        username: ["Invalid username or password"],
      },
    };
  }

  await createSession(user.id);

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
