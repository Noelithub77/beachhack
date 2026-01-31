import { NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

// handle incoming/outgoing call routing
export async function POST(req: Request) {
    const formData = await req.formData();
    const to = formData.get("To") as string;
    const from = formData.get("From") as string;
    const callSid = formData.get("CallSid") as string;

    const response = new VoiceResponse();

    if (to) {
        // outgoing call to client identity
        const dial = response.dial({ callerId: from });
        dial.client(to);
    } else {
        // incoming call without destination - play hold message
        response.say("Please wait while we connect you.");
        response.pause({ length: 2 });
    }

    return new NextResponse(response.toString(), {
        headers: { "Content-Type": "text/xml" },
    });
}

// handle call status updates
export async function GET(req: Request) {
    const url = new URL(req.url);
    const callSid = url.searchParams.get("CallSid");
    const status = url.searchParams.get("CallStatus");

    console.log(`Call ${callSid} status: ${status}`);
    return NextResponse.json({ received: true });
}
