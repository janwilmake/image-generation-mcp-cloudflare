import { WorkerEntrypoint } from 'cloudflare:workers';
import { ProxyToSelf } from 'workers-mcp';

export default class MyWorker extends WorkerEntrypoint<Env> {
	/**
	 * Generate an image using the `flux-1-schnell` model. Works best with 8 steps.
	 *
	 * @param {string} prompt - A text description of the image you want to generate.
	 * @param {number} steps - The number of diffusion steps; higher values can improve quality but take longer. Must be between 4 and 8, inclusive.
	 * */
	async generateImage(prompt: string, steps: number) {
		const response = await this.env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
			prompt,
			steps,
		});
		// Convert from base64 string
		const binaryString = atob(response.image);
		// Create byte representation
		const img = Uint8Array.from(binaryString, (m) => m.codePointAt(0)!);
		return new Response(img, {
			headers: {
				'Content-Type': 'image/jpeg',
			},
		});
	}

	/**
	 * @ignore
	 **/
	async fetch(request: Request): Promise<Response> {
		return new ProxyToSelf(this).fetch(request);
	}
}

export interface Env {
	AI: Ai;
}