import client from "./client";

export type Session =
  | { kind: "admin" }
  | { kind: "user"; user_id: number; name: string; email: string };

export async function login(email: string, password: string) {
  const response = await client.post<{ access: string; refresh: string }>(
    "/auth/login/",
    {
      username: email,
      password,
    },
  );
  return response.data;
}

export type NewUser = {
  user_id: number;
  name: string;
  email: string;
  created_at: string;
};

export async function createUser(name: string, email: string, password: string) {
  const response = await client.post<NewUser>("/users/", {
    name,
    email,
    password,
  });
  return response.data;
}

export async function fetchMe(): Promise<Session> {
  const response = await client.get<Session>("/auth/me/");
  return response.data;
}

export async function logoutRequest(refresh: string) {
  await client.post("/auth/logout/", { refresh });
}
