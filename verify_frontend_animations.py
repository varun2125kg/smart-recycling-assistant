import json
import urllib.request
import urllib.parse
import sys

BASE_URL = "http://localhost:5050"

def test_endpoint(name, path, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    url = BASE_URL + path
    try:
        req_data = None
        if data:
            if isinstance(data, dict):
                req_data = json.dumps(data).encode("utf-8")
                headers["Content-Type"] = "application/json"
            elif isinstance(data, bytes):
                req_data = data
        req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
            status = resp.status
            return status, content
    except Exception as e:
        print(f"❌ {name} failed: {e}")
        return None, None

def verify_all():
    print("=== ECOVISION AI FRONTEND & BACKEND AUDIT ===")
    
    # 1. Check Root Page
    status, html_bytes = test_endpoint("Index HTML", "/")
    if status == 200 and b"ENVIRONMENTAL INTELLIGENCE PLATFORM" in html_bytes:
        print("✅ Root page loaded successfully (HTTP 200)")
        html_str = html_bytes.decode("utf-8")
        assert "btn-primary-action" in html_str
        assert "nav-menu-link" in html_str
        assert "upload-dropzone-surface" in html_str
        assert "silo-telemetry-card" in html_str
        assert "specimen-preset-card" in html_str
        print("✅ All required UI component IDs and classes verified in templates/index.html")
    else:
        print(f"❌ Root page check failed with status {status}")
        sys.exit(1)

    # 2. Check CSS Assets
    status, css_bytes = test_endpoint("Style CSS", "/static/style.css")
    if status == 200:
        css_str = css_bytes.decode("utf-8")
        assert "--transition-button: 200ms cubic-bezier(0.16, 1, 0.3, 1)" in css_str
        assert "@keyframes pageFadeRise" in css_str
        assert "transform: translateY(20px)" in css_str
        assert "transform: translateY(-2px)" in css_str
        assert "transform: translateY(0) scale(0.98)" in css_str
        assert "scaleX(1)" in css_str
        assert "prefers-reduced-motion" in css_str
        print("✅ static/style.css verified with 200ms button transitions, 20px page rise, animated underline, and reduced-motion guards")
    else:
        print(f"❌ Style CSS check failed with status {status}")
        sys.exit(1)

    # 3. Check JS Assets
    status, js_bytes = test_endpoint("Script JS", "/static/script.js")
    if status == 200:
        js_str = js_bytes.decode("utf-8")
        assert "initScrollReveals" in js_str
        assert "IntersectionObserver" in js_str
        assert ".silo-telemetry-card" in js_str
        assert ".analytics-chart-card" in js_str
        assert "stage.classList.remove('scanning')" in js_str
        print("✅ static/script.js verified with IntersectionObserver reveals and scanner teardown")
    else:
        print(f"❌ Script JS check failed with status {status}")
        sys.exit(1)

    # 4. Check Health API
    status, health_bytes = test_endpoint("Health API", "/api/health")
    if status == 200:
        data = json.loads(health_bytes)
        assert data.get("status") == "online"
        print(f"✅ /api/health online: {data.get('facility_node')}")
    else:
        print(f"❌ Health API failed with status {status}")
        sys.exit(1)

    # 5. Check Twin Streams (All 6 Streams)
    status, twin_bytes = test_endpoint("Twin Streams API", "/api/digital-twin")
    if status == 200:
        data = json.loads(twin_bytes)
        bins = data.get("bins", {})
        expected_streams = ["plastic", "paper", "metal", "glass", "organic", "hazardous"]
        for s in expected_streams:
            assert s in bins, f"Missing stream {s}"
        print(f"✅ Digital Twin verified with all 6 streams: {list(bins.keys())}")
    else:
        print(f"❌ Twin API failed with status {status}")
        sys.exit(1)

    # 6. Check Chat API
    chat_payload = {"prompt": "How should I recycle an aluminum can?"}
    status, chat_bytes = test_endpoint("Chat API", "/api/chat", method="POST", data=chat_payload)
    if status == 200:
        data = json.loads(chat_bytes)
        assert "response" in data
        print("✅ AI Advisor /api/chat responded successfully")
    else:
        print(f"❌ Chat API failed with status {status}")
        sys.exit(1)

    # 7. Check History Ledger API
    status, hist_bytes = test_endpoint("History API", "/api/history")
    if status == 200:
        data = json.loads(hist_bytes)
        print(f"✅ /api/history returned {len(data.get('history', []))} records")
    else:
        print(f"❌ History API failed with status {status}")
        sys.exit(1)

    print("\n🎉 ALL TESTS AND ASSET VERIFICATIONS PASSED!")

if __name__ == "__main__":
    verify_all()
