import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, apiPassword, method, ...rest } = body;

    if (!email || !apiPassword || !method) {
      return NextResponse.json({ status: "missing_credentials" }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append("api_username", email);
    params.append("api_password", apiPassword);
    params.append("method", method);

    // Append any additional parameters
    Object.entries(rest).forEach(([key, value]) => {
      params.append(key, String(value));
    });

    const response = await fetch(`https://voip.ms/api/v1/rest.php?${params.toString()}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy error:", error);
    return NextResponse.json({ status: "proxy_error" }, { status: 500 });
  }
}
