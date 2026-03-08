import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const targetEmail = "kjais1104@gmail.com";
  const newPassword = "Krishna@1104()";

  try {
    // Find the user by email
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = listData.users.find((u) => u.email === targetEmail);

    if (!user) {
      // User doesn't exist — create them
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: targetEmail,
        password: newPassword,
        email_confirm: true,
      });
      if (createError) throw createError;

      const userId = createData.user.id;

      // Seed super_admin role
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: "super_admin",
        city: "Bareilly",
      }, { onConflict: "user_id,role" });

      // Upsert profile
      await supabaseAdmin.from("profiles").upsert({
        user_id: userId,
        email: targetEmail,
        full_name: "Super Admin",
        role: "super_admin",
        status: "approved",
      }, { onConflict: "user_id" });

      return new Response(JSON.stringify({ ok: true, action: "created", userId }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // User exists — confirm email + update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      password: newPassword,
    });
    if (updateError) throw updateError;

    // Ensure super_admin role exists with correct user_id
    await supabaseAdmin.from("user_roles").upsert({
      user_id: user.id,
      role: "super_admin",
      city: "Bareilly",
    }, { onConflict: "user_id,role" });

    // Ensure profile is approved
    await supabaseAdmin.from("profiles").upsert({
      user_id: user.id,
      email: targetEmail,
      full_name: "Super Admin",
      role: "super_admin",
      status: "approved",
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify({ ok: true, action: "updated", userId: user.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
