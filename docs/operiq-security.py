from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User, Users
from diagrams.aws.security import Cognito, IAM, KMS
from diagrams.generic.network import Firewall, Router
from diagrams.generic.compute import Rack
from diagrams.generic.storage import Storage
from diagrams.onprem.network import Nginx
from diagrams.aws.network import CloudFront
from diagrams.programming.language import Javascript

graph_attr = {
    "fontsize": "22",
    "bgcolor": "#faf9f5",
    "splines": "spline",
    "pad": "1.0",
    "nodesep": "0.9",
    "ranksep": "1.2",
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
    "fontsize": "10",
    "penwidth": "1.5",
}

with Diagram(
    "Operiq AI — Security Architecture",
    filename="operiq-security",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    outformat="png",
):
    user = User("User")

    with Cluster("Authentication Layer"):
        password_auth = IAM("Password Auth")
        oauth_auth = IAM("OAuth Providers")
        convex_auth = Cognito("Convex Auth")
        jwt = KMS("JWT Token")

    with Cluster("Guard Layer"):
        auth_gate = Firewall("AuthGate")
        route_guard = Router("Route Protection")
        devtools_guard = Firewall("DevTools Guard")
        rate_limiter = Nginx("Rate Limiter")

    with Cluster("Data Isolation"):
        rls = IAM("Row-Level Security")
        user_id_check = IAM("User ID Checks")
        data_store = Storage("User-Scoped Data")

    with Cluster("Edge Security"):
        security_headers = CloudFront("Security Headers")
        csp = Nginx("Content-Security-Policy")

    with Cluster("Protected Routes"):
        app_routes = Javascript("App Routes")

    user >> Edge(label="login/signup") >> password_auth
    user >> Edge(label="social login") >> oauth_auth
    password_auth >> Edge(label="credentials") >> convex_auth
    oauth_auth >> Edge(label="OAuth flow") >> convex_auth
    convex_auth >> Edge(label="issue") >> jwt
    jwt >> Edge(label="Bearer token") >> auth_gate
    auth_gate >> Edge(label="valid") >> route_guard

    route_guard >> Edge(label="allowed") >> app_routes

    auth_gate >> Edge(label="blocked", color="#c64545", style="dotted") >> devtools_guard
    rate_limiter >> Edge(label="429", color="#c64545", style="dotted") >> auth_gate

    app_routes >> Edge(label="query/mutate") >> rls
    rls >> Edge(label="filter by user") >> user_id_check
    user_id_check >> Edge(label="scoped access") >> data_store

    security_headers >> Edge(label="headers") >> app_routes
    csp >> Edge(label="restrict") >> app_routes

print("Saved: operiq-security.png")
