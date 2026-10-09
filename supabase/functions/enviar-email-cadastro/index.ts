import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req) => {
    const { email, nome } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [email],
        subject: "Bem-vindo ao F.O.C.O!",
        html: `<h1>Olá, ${nome}!</h1><p>Seu cadastro no F.O.C.O foi realizado com sucesso. Bora organizar seus estudos! 🎯</p>`,
      }),
    });

    const data = await resendResponse.json();

    return Response.json({ sucesso: resendResponse.ok, data });
  }),
};