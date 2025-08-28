from flask import Flask, jsonify, request
from threading import Thread, Event
import time

app = Flask(__name__)

# Timer state
timer_data = {
    "duration": 0,   # total seconds
    "remaining": 0,
    "running": False
}

stop_event = Event()

def run_timer():
    while timer_data["remaining"] > 0 and not stop_event.is_set():
        time.sleep(1)
        timer_data["remaining"] -= 1
    timer_data["running"] = False


@app.route("/start", methods=["POST"])
def start_timer():
    global stop_event
    data = request.get_json()
    duration = data.get("duration", 0)

    if duration <= 0:
        return jsonify({"error": "Invalid duration"}), 400

    timer_data["duration"] = duration
    timer_data["remaining"] = duration
    timer_data["running"] = True
    stop_event.clear()

    thread = Thread(target=run_timer)
    thread.start()
    return jsonify({"message": "Timer started", "duration": duration})


@app.route("/pause", methods=["POST"])
def pause_timer():
    global stop_event
    stop_event.set()
    timer_data["running"] = False
    return jsonify({"message": "Timer paused"})


@app.route("/reset", methods=["POST"])
def reset_timer():
    global stop_event
    stop_event.set()
    timer_data["remaining"] = timer_data["duration"]
    timer_data["running"] = False
    return jsonify({"message": "Timer reset"})


@app.route("/status", methods=["GET"])
def status():
    return jsonify(timer_data)


if __name__ == "__main__":
    app.run(debug=True)
