@set GEVENT_LOOP=uvent.loop.UVLoop
@set GEVENT_RESOLVER=gevent.resolver_thread.Resolver
@"%~dp0python27.exe" "%~dp0proxy.py" || pause
