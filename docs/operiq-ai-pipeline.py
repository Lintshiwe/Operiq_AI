from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User
from diagrams.generic.compute import Rack
from diagrams.aws.compute import Lambda
from diagrams.generic.storage import Storage
from diagrams.programming.language import Python
from diagrams.onprem.network import Nginx

graph_attr = {
    "fontsize": "22",
    "bgcolor": "#faf9f5",
    "splines": "spline",
    "pad": "1.0",
    "nodesep": "0.9",
    "ranksep": "1.3",
}

node_attr = {
    "fontsize": "12",
    "fontcolor": "#141413",
    "penwidth": "2.5",
    "style": "filled",
    "fillcolor": "#efe9de",
}

edge_attr = {
    "color": "#cc785c",
    "fontcolor": "#6c6a64",
    "fontsize": "11",
    "penwidth": "1.5",
}

with Diagram(
    "Operiq AI — AI Pipeline",
    filename="operiq-ai-pipeline",
    show=False,
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    outformat="png",
):
    task_input = User("User Prompt + Task Type")

    with Cluster("Model Routing Layer"):
        classifier = Rack("Task Classifier")
        model_selector = Rack("Model Selector")
        prompt_assembler = Python("Prompt Assembler")

    with Cluster("Multi-Provider Strategy"):
        openai_chat = Rack("GPT-4o\n(Chat)")
        openai_code = Rack("Claude\n(Code)")
        openai_reasoning = Rack("GPT-4o\n(Reasoning)")

    with Cluster("Media Generation"):
        hf_image = Rack("FLUX.1\n(Image Gen)")
        hf_video = Rack("HunyuanVideo\n(Video Gen)")
        tts_engine = Rack("ElevenLabs\n(TTS/STT)")

    with Cluster("Tool System"):
        web_search = Lambda("web_search")
        fetch_url = Lambda("fetch_url")
        generate_img = Lambda("generate_image")
        generate_vid = Lambda("generate_video")

    with Cluster("Post-Processing"):
        cleanup = Nginx("Content Filter")
        format_out = Storage("Format Output")
        stream = Nginx("Streaming")

    final_output = User("Final Response")

    task_input >> Edge(label="classify") >> classifier
    classifier >> Edge(label="type") >> model_selector
    model_selector >> Edge(label="model + config") >> prompt_assembler

    prompt_assembler >> Edge(label="chat", color="#cc785c", style="bold") >> openai_chat
    prompt_assembler >> Edge(label="code", color="#5db8a6", style="bold") >> openai_code
    prompt_assembler >> Edge(label="reasoning", color="#e8a55a", style="bold") >> openai_reasoning

    prompt_assembler >> Edge(label="image", color="#c64545") >> hf_image
    prompt_assembler >> Edge(label="video", color="#c64545") >> hf_video
    prompt_assembler >> Edge(label="audio", color="#c64545") >> tts_engine

    prompt_assembler >> Edge(label="tool call", color="#6c6a64", style="dotted") >> web_search
    prompt_assembler >> Edge(label="tool call", color="#6c6a64", style="dotted") >> fetch_url
    prompt_assembler >> Edge(label="tool call", color="#6c6a64", style="dotted") >> generate_img
    prompt_assembler >> Edge(label="tool call", color="#6c6a64", style="dotted") >> generate_vid

    openai_chat >> cleanup
    openai_code >> cleanup
    openai_reasoning >> cleanup
    hf_image >> cleanup
    hf_video >> cleanup
    tts_engine >> cleanup
    web_search >> cleanup
    fetch_url >> cleanup
    generate_img >> cleanup
    generate_vid >> cleanup

    cleanup >> Edge(label="sanitized output") >> format_out
    format_out >> Edge(label="structured") >> stream
    stream >> Edge(label="SSE/chunks") >> final_output

print("Saved: operiq-ai-pipeline.png")
