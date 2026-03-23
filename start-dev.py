import subprocess
import time
import sys
import os
import signal
import threading

# Define colors for output
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"

processes = []

def signal_handler(sig, frame):
    print(f"\n{YELLOW}Shutting down all services...{RESET}")
    for p in processes:
        p.terminate()
    print(f"{GREEN}Done.{RESET}")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def run_service(name, cmd, cwd, color):
    print(f"{color}[{name}] Starting...{RESET}")
    process = subprocess.Popen(cmd, cwd=cwd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    processes.append(process)
    
    # Start a thread to monitor output
    t = threading.Thread(target=monitor_output, args=(name, process, color))
    t.daemon = True
    t.start()
    
    return process

def monitor_output(name, process, color):
    for line in iter(process.stdout.readline, ""):
        if line:
            print(f"{color}[{name}]{RESET} {line.strip()}")

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Start AI Service (Python)
    # Check if .venv exists and use it, otherwise use system python
    ai_service_dir = os.path.join(root_dir, "ai-service")
    venv_python = os.path.join(ai_service_dir, ".venv", "bin", "python")
    
    if os.path.exists(venv_python):
        ai_cmd = f"{venv_python} -m uvicorn main:app --reload --port 8000"
    else:
        ai_cmd = "python3 -m uvicorn main:app --reload --port 8000"
        
    p_ai = run_service("AI_SERVICE", ai_cmd, ai_service_dir, BLUE)
    
    # Start Backend
    p_backend = run_service("BACKEND", "npm run dev", os.path.join(root_dir, "backend"), GREEN)
    
    # Let services initialize
    time.sleep(2)
    
    # Start Frontend
    p_frontend = run_service("FRONTEND", "npm run dev", os.path.join(root_dir, "frontend"), YELLOW)
    
    print(f"\n{GREEN}All services are starting!{RESET}")
    print(f"{BLUE}AI Service: http://localhost:8000{RESET}")
    print(f"{GREEN}Backend: http://localhost:5001{RESET}")
    print(f"{YELLOW}Frontend: http://localhost:5173{RESET}")
    print(f"\nPress Ctrl+C to stop all services.\n")
    
    # This is a simple blocker to keep the script running
    try:
        while True:
            time.sleep(1)
            # Check if any process died
            for i, p in enumerate([p_ai, p_backend, p_frontend]):
                if p.poll() is not None:
                    names = ["AI_SERVICE", "BACKEND", "FRONTEND"]
                    # If it died with non-zero exit code, it might be an issue
                    if p.returncode != 0:
                        print(f"{RED}[{names[i]}] CRASHED! Exit code: {p.returncode}{RESET}")
                        signal_handler(None, None)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()
