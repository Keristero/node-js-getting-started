print("startup, downloading latest pastebin for remote")
shell.run("delete", "remote")
shell.run("pastebin", "get", "UKc98h2s", "remote")
print("downloaded, running remote")
shell.run("remote")