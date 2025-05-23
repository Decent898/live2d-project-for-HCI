from gradio_client import Client, handle_file

client = Client("http://127.0.0.1:7860/")
result = client.predict(
		text="你好",
		speaker="派蒙_ZH",
		sdp_ratio=0.2,
		noise_scale=0.6,
		noise_scale_w=0.8,
		length_scale=1,
		language="ZH",
		reference_audio=handle_file('https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav'),
		emotion="Happy",
		prompt_mode="Text prompt",
		style_text=None,
		style_weight=0.7,
		api_name="/tts_fn"
)
print(result)
