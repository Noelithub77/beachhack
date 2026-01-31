import { NextResponse } from "next/server";

const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY!;
const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

// text-to-speech via ElevenLabs
export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: "Text required" }, { status: 400 });
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: "POST",
                headers: {
                    "xi-api-key": elevenLabsApiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("ElevenLabs error:", error);
            return NextResponse.json({ error: "TTS failed" }, { status: 500 });
        }

        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error("TTS error:", error);
        return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
    }
}
