build-client:
	pnpm run build-client
	rm -rf packages/server/client
	cp -r packages/client/dist packages/server/client