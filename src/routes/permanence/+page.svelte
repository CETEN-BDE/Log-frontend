<script lang="ts">
	import { onMount } from 'svelte';
	import client from '$lib/api/index.js';

	let currentDate = new Date();
	let selectedMonth = currentDate.getMonth();
	let selectedYear = currentDate.getFullYear();

	type Person = {
		userId: number;
		name: string;
		permissions: number;
		schedule: Record<string, 'available' | 'unavailable' | 'selected' | undefined>;
	};

	let people: Person[] = [];

    let weekName = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'];

	let weekdayPreferences = [
		{ day: 1, priority: 1 },
		{ day: 2, priority: 2 },
		{ day: 3, priority: 3 },
		{ day: 4, priority: 4 },
		{ day: 5, priority: 5 }
	];

	let draggedItem: any = null;
	let draggedIndex: number | null = null;

	async function getPeople() {
		return client.GET('/accounts/{clubId}', {
			params: {
				path: {
					clubId: 1
				}
			}
		});
	}

	async function getPlanning(userId: number) {
		return client.GET('/planning/{accountID}', {
			params: {
				path: {
					accountID: userId
				}
			}
		});
	}

    async function createPlanning(userId: number, date: string, status: 'available' | 'unavailable' | 'selected') {
        return client.POST('/planning/{accountID}', {
            params: {
                path: {
                    accountID: userId
                }
            },

            body: {
                date: date,
                status: status,
            }
        });
    }

	async function patchPlanning(userId: number, date: string, status: 'available' | 'unavailable' | 'selected') {
        return client.PATCH('/planning/{accountID}', {
            params: {
                path: {
                    accountID: userId
                }
            },

            body: {
                date: date,
				status: status,
            }
        });
    }

    async function deletePlanning(userId: number, date: string) {
        return client.DELETE('/planning/{accountID}', {
            params: {
                path: {
                    accountID: userId
                }
            },

            body: {
                date: date,
                status: 'unavailable',
            }
        });
    }

    async function loadPeople() {
        getPeople().then((res) => {
			people = res.data
				? res.data.map((person: any) => ({
						userId: person.userId,
						name: `${person.FirstName} ${person.LastName} (${person.Group})`,
						permissions: 0,
						schedule: {}
					}))
				: [];
			people.forEach((person) => {
				getPlanning(person.userId).then((res) => {
					if (res.data) {
						person.schedule = res.data.reduce((acc: Record<string, 'available' | 'unavailable' | 'selected'>, item: { date: string; status: 'available' | 'unavailable' | 'selected'}) => {
							acc[item.date] = item.status;
							return acc;
						}, {});
						person.permissions = Object.values(person.schedule).filter((status) => status === 'selected').length;
                        people = [...people];
					}
				});
			});
			console.log(people);
		});
    }

    async function postAutoFillPlanning(startDate: Date, endDate: Date) {
        return client.POST('/planning/autofill', {
            body: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
            }
        });
    }

    async function getWeekPriority(accountID: number) {
        return client.GET('/planning/weekPriority/{accountID}', {
            params: {
                path: {
                    accountID: accountID
                }
            }
        });
    }

    async function patchWeekPriority(accountID: number, weekPriority: { day: number; priority: number }[]) {
        return client.PATCH('/planning/weekPriority/{accountID}', {
            params: {
                path: {
                    accountID: accountID
                }
            },

            body: {
                weekPriority
            }
        });
    }

    function loadWeekPriority(accountID: number) {
        getWeekPriority(accountID).then((res) => {
            if (res.data) {
                weekdayPreferences = res.data.weekPriority
                    .map((pref: { day: number; priority: number }) => ({
                        day: pref.day,
                        name: weekName[pref.day - 1],
                        priority: pref.priority
                    }))
                    .sort((a, b) => a.priority - b.priority);
            }
        });
    }

    function getAccountID() {
        return 1
    }

	onMount(() => {
		loadPeople();
        loadWeekPriority(getAccountID());
	});

	function getDaysInMonth(month: number, year: number) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getWeekDates() {
		const dates = [];
		const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(selectedYear, selectedMonth, i);
			if (date.getDay() !== 0 && date.getDay() !== 6) {
				dates.push(date);
			}
		}

		return dates;
	}

	$: weekDates = getWeekDates();

	function formatDate(date: Date) {
		const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
		return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString('fr-FR', { month: 'long' })}`;
	}

	function toggleSchedule(person: Person, date: string) {
		if (person.schedule[date] === undefined) {
			person.schedule[date] = 'available';
            createPlanning(person.userId, date, person.schedule[date]);
		} else if (person.schedule[date] === 'available') {
			person.permissions = person.permissions + 1;
			person.schedule[date] = 'selected';
            patchPlanning(person.userId, date, person.schedule[date]);
		} else if (person.schedule[date] === 'selected') {
			person.permissions = person.permissions - 1;
			person.schedule[date] = 'unavailable';
            patchPlanning(person.userId, date, person.schedule[date]);
		} else if (person.schedule[date] === 'unavailable') {
			person.schedule[date] = undefined;
            deletePlanning(person.userId, date);
		}
		people = [...people];
	}

	function getPreviousMonth() {
		if (selectedMonth === 0) {
			selectedMonth = 11;
			selectedYear--;
		} else {
			selectedMonth--;
		}
		weekDates = getWeekDates();
	}

	function getNextMonth() {
		if (selectedMonth === 11) {
			selectedMonth = 0;
			selectedYear++;
		} else {
			selectedMonth++;
		}
		weekDates = getWeekDates();
	}

	function handleDragStart(event: DragEvent, index: number) {
		draggedItem = weekdayPreferences[index];
		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		const newPreferences = [...weekdayPreferences];
		const [reorderedItem] = newPreferences.splice(draggedIndex, 1);
		newPreferences.splice(index, 0, reorderedItem);

		weekdayPreferences = newPreferences;
		draggedIndex = index;
	}

	function handleDragEnd() {
		draggedItem = null;
		draggedIndex = null;
		updatePriorities();
	}

	function updatePriorities() {
		weekdayPreferences = weekdayPreferences.map((pref, index) => ({
			...pref,
			priority: index + 1
		}));
        patchWeekPriority(getAccountID(), weekdayPreferences);
	}

	function autoFillPlanning() {
		postAutoFillPlanning(weekDates[0], weekDates[weekDates.length - 1])
	}

	function isStartOfWeek(date: Date): boolean {
		return date.getDay() === 1;
	}

	function getWeekNumber(date: Date): number {
		const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
		const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
		return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
	}
</script>

<svelte:head>
	<title>Log BDE - Permanence Planning</title>
	<style>
		.gradient-bg {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}
		.planning-shadow {
			box-shadow:
				0 4px 6px -1px rgba(0, 0, 0, 0.1),
				0 2px 4px -1px rgba(0, 0, 0, 0.06);
		}
	</style>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="gradient-bg py-6 text-white">
		<div class="container mx-auto px-4">
			<div class="flex items-center justify-between">
				<h1 class="text-3xl font-bold">Permanence Planning</h1>
				<nav class="hidden space-x-6 md:flex">
					<a href="/permanence" class="transition-colors hover:text-indigo-200">Current Month</a>
					<a href="/" class="transition-colors hover:text-indigo-200">Back to Home</a>
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-6xl">
			<!-- Month Navigation -->
			<div class="planning-shadow mb-8 rounded-lg bg-white p-6">
				<div class="mb-6 flex items-center justify-between">
					<div class="flex gap-2">
						<button
							on:click={getPreviousMonth}
							class="rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
						>
							← Previous
						</button>
						<button
							on:click={getNextMonth}
							class="rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
						>
							Next →
						</button>
					</div>
					<h2 class="text-2xl font-semibold text-gray-800">
						{new Date(selectedYear, selectedMonth).toLocaleString('fr-FR', {
							month: 'long',
							year: 'numeric'
						})}
					</h2>
				</div>

				<!-- Planning Table -->
				<div class="planning-shadow overflow-x-auto rounded-lg">
					<table class="w-full border-collapse">
						<thead>
							<tr class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
								<th class="sticky left-0 z-10 border-r border-indigo-500 p-4">Nom</th>
								<th class="border-r border-indigo-500 p-4">Perm</th>
								{#each weekDates as date, index}
									<th
										class="min-w-[120px] border-r border-indigo-500 p-4 {isStartOfWeek(date)
											? 'border-l-4 border-l-indigo-300'
											: ''}"
									>
										{formatDate(date)}
										{#if isStartOfWeek(date)}
											<div class="text-xs font-normal">Semaine {getWeekNumber(date)}</div>
										{/if}
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each people as person, personIndex}
								<tr class="bg-white transition-colors hover:bg-indigo-50">
									<td class="sticky left-0 border-r bg-white p-4 font-medium">
										{person.name}
									</td>
									<td class="border-r p-4 text-center">{person.permissions}</td>
									{#each weekDates as date, dateIndex}
										{@const dateStr = date.toISOString().split('T')[0]}
										<td
											class="cursor-pointer border-r p-4 {isStartOfWeek(date)
												? 'border-l-4 border-l-indigo-300'
												: ''}"
											class:bg-blue-100={person.schedule[dateStr] === 'available'}
											class:bg-green-100={person.schedule[dateStr] === 'selected'}
											class:bg-red-100={person.schedule[dateStr] === 'unavailable'}
											on:click={() => toggleSchedule(person, dateStr)}
										>
											<div
												class="mx-auto flex h-8 w-8 items-center justify-center rounded-full
                                                {person.schedule[dateStr] === 'selected'
													? 'bg-green-500'
													: person.schedule[dateStr] === 'available'
														? 'bg-blue-500'
														: person.schedule[dateStr] === 'unavailable'
															? 'bg-red-500'
															: 'bg-gray-200'} text-white shadow-md"
											>
												{person.schedule[dateStr] === 'selected'
													? 'X'
													: person.schedule[dateStr] === 'available'
														? 'O'
														: person.schedule[dateStr] === 'unavailable'
															? '-'
															: ''}
											</div>
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Weekday Preferences -->
			<div class="planning-shadow rounded-lg bg-white p-6">
				<h2 class="mb-4 text-xl font-semibold text-gray-800">Préférences des jours</h2>
				<p class="mb-6 text-sm text-gray-600">
					Glissez et déposez pour réorganiser par ordre de préférence
				</p>

				<div class="mb-6 flex flex-wrap gap-3">
					{#each weekdayPreferences as pref, index (pref.day)}
						<div
							role="listitem"
							draggable={true}
							on:dragstart={(e) => handleDragStart(e, index)}
							on:dragover={(e) => handleDragOver(e, index)}
							on:dragend={handleDragEnd}
							class="flex cursor-move items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4
                                   py-2 transition-colors hover:bg-indigo-100"
						>
							<span class="font-medium text-indigo-600">{index + 1}.</span>
							<span class="text-gray-700">{weekName[pref.day - 1]}</span>
						</div>
					{/each}
				</div>

				<button
					on:click={autoFillPlanning}
					class="rounded-md bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
				>
					Remplir automatiquement
				</button>
			</div>
		</div>
	</main>
</div>

<style>
	.sticky {
		backdrop-filter: saturate(180%) blur(5px);
	}

	/* Scrollbar styling */
	.overflow-x-auto::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.overflow-x-auto::-webkit-scrollbar-track {
		background: #e0e7ff;
	}

	.overflow-x-auto::-webkit-scrollbar-thumb {
		background-color: #818cf8;
		border-radius: 6px;
		border: 3px solid #e0e7ff;
	}
</style>
