import os
import asyncio
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.plugins import elevenlabs

load_dotenv()

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.SUBSCRIBE_ALL)
    print("Krishna Voice Agent connected to the room!")

    # Initialize ElevenLabs TTS
    # We use a deep voice suitable for Krishna. (e.g., 'pNInz6obbf5AWm20fURe' is a default voice ID)
    tts = elevenlabs.TTS(
        voice=elevenlabs.Voice(id="pNInz6obbf5AWm20fURe", name="Krishna")
    )

    # Set up the audio source to push synthesized audio to the room
    source = rtc.AudioSource(tts.sample_rate, tts.num_channels)
    track = rtc.LocalAudioTrack.create_audio_track("krishna_voice", source)
    options = rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
    
    await ctx.room.local_participant.publish_track(track, options)

    # Listen for text messages from the frontend over the data channel
    @ctx.room.on("data_received")
    def on_data_received(data: rtc.DataPacket):
        text = data.data.decode("utf-8")
        print(f"Krishna is speaking: {text}")
        asyncio.create_task(speak_text(text))

    async def speak_text(text: str):
        try:
            # Stream the synthesized audio into the LiveKit room
            async for audio in tts.synthesize(text):
                await source.capture_frame(audio.frame)
        except Exception as e:
            print(f"Error during Text-to-Speech: {e}")

if __name__ == "__main__":
    # Start the worker agent
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
