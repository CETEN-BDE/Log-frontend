<script>
	// You can add any necessary JavaScript logic here
</script>

<svelte:head>
	<title>Log BDE - Open Source Logistics Platform for BDE</title>
	<style>
		.gradient-bg {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}
	</style>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gray-50">
	<!-- Header -->
	<header class="gradient-bg py-6 text-white">
		<div class="container mx-auto px-4">
			<div class="flex items-center justify-between">
				<h1 class="text-3xl font-bold">Log BDE</h1>
				<nav class="hidden space-x-6 md:flex">
					<a href="/permanence" class="transition-colors hover:text-indigo-200">Permanence</a>
					<a href="/tools" class="transition-colors hover:text-indigo-200">Tools</a>
					<a href="/about" class="transition-colors hover:text-indigo-200">About</a>
					<a href="https://github.com/CETEN-BDE/" class="transition-colors hover:text-indigo-200"
						>GitHub</a
					>
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto flex-1 px-4 py-12">
		<div class="mx-auto max-w-4xl">
			<h2 class="mb-6 text-4xl font-bold text-gray-800">Logistics Made Simple for BDE</h2>

			<div class="grid gap-8 md:grid-cols-2">
				<!-- Permanence Tool Card -->
				<div class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
					<h3 class="mb-4 text-xl font-semibold text-gray-800">Permanence</h3>
					<p class="mb-4 text-gray-600">
						Manage student shifts and track who should be present each day from 6PM to 7PM.
					</p>
					<a
						href="/permanence"
						class="rounded-md bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
						aria-label="Go to Permanence tool"
					>
						Go to Permanence
					</a>
				</div>

				<!-- Coming Soon Card -->
				<div class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
					<div class="flex items-center">
						<div class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
							<svg
								class="h-6 w-6 text-indigo-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<div>
							<h3 class="mb-2 text-xl font-semibold text-gray-800">More Tools Coming Soon</h3>
							<p class="text-gray-600">
								Stay tuned for additional powerful tools for BDE activities.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="mt-12 bg-gray-800 py-8 text-white">
		<div class="container mx-auto px-4">
			<div class="grid gap-8 md:grid-cols-3">
				<div>
					<h4 class="mb-4 text-xl font-semibold">Log BDE</h4>
					<p class="text-gray-400">Your logistics platform for BDE activities.</p>
					<a
						href="https://github.com/yourusername/log-bde"
						class="text-indigo-400 hover:text-indigo-300"
						aria-label="View on GitHub"
					>
						View on GitHub
					</a>
				</div>
				<div>
					<h4 class="mb-4 text-xl font-semibold">Tools</h4>
					<ul class="space-y-2 text-gray-400">
						<li><a href="/permanence" class="transition-colors hover:text-white">Permanence</a></li>
						<li><a href="/tools" class="transition-colors hover:text-white">All Tools</a></li>
					</ul>
				</div>
				<div>
					<h4 class="mb-4 text-xl font-semibold">CETEN BDE</h4>
					<ul class="space-y-2 text-gray-400">
						<li><a href="/about" class="transition-colors hover:text-white">About</a></li>
						<li><a href="/contact" class="transition-colors hover:text-white">Contact</a></li>
						<li>
							<a href="/contributors" class="transition-colors hover:text-white">Contributors</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</footer>
</div>
