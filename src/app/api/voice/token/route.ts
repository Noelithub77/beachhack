import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const apiKey = process.env.TWILIO_API_KEY!;
const apiSecret = process.env.TWILIO_API_SECRET!;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID!;

// generate Twilio access token for client SDK
export async function POST(req: Request) {
    try {
        const { identity } = await req.json();
        if (!identity) {
            return NextResponse.json({ error: "Identity required" }, { status: 400 });
        }

        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        const token = new AccessToken(accountSid, apiKey, apiSecret, {
            identity,
            ttl: 3600,
        });

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: twimlAppSid,
            incomingAllow: true,
        });
        token.addGrant(voiceGrant);

        return NextResponse.json({
            token: token.toJwt(),
            identity,
        });
    } catch (error) {
        console.error("Token generation error:", error);
        return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
    }
}
