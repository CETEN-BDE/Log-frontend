<script lang="ts">
	import { onMount } from 'svelte';

	let currentDate = new Date();
	let selectedMonth = currentDate.getMonth();
	let selectedYear = currentDate.getFullYear();

	type Person = {
		name: string;
		permissions: number;
		schedule: Record<string, 'available' | 'unavailable' | 'selected' | undefined>;
	};

	let people: Person[] = [
		{ name: 'Ambre (G22)', permissions: 0, schedule: {} },
		{ name: 'Baptiste JULLIEN (ISS-1)', permissions: 0, schedule: {} },
		{ name: 'Ely (ISS-2)', permissions: 0, schedule: {} },
		{ name: 'Florian (ISS-2)', permissions: 0, schedule: {} },
		{ name: 'Gabriel (G11)', permissions: 0, schedule: {} },
		{ name: 'Hippolyte (IL)', permissions: 0, schedule: {} },
		{ name: 'Malo (R1-G22)', permissions: 0, schedule: {} },
		{ name: 'Maxence (G12)', permissions: 0, schedule: {} },
		{ name: 'Quentin (G11)', permissions: 0, schedule: {} },
		{ name: 'Raphaël (G12)', permissions: 0, schedule: {} },
		{ name: 'Salif (G12)', permissions: 0, schedule: {} },
		{ name: 'Sylvie (ISS-2)', permissions: 0, schedule: {} },
		{ name: 'Théo (FISA)', permissions: 0, schedule: {} }
	];

	let weekdayPreferences = [
		{ day: 1, name: 'lun.', priority: 1 },
		{ day: 2, name: 'mar.', priority: 2 },
		{ day: 3, name: 'mer.', priority: 3 },
		{ day: 4, name: 'jeu.', priority: 4 },
		{ day: 5, name: 'ven.', priority: 5 }
	];

	let draggedItem: any = null;
	let draggedIndex: number | null = null;

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
		} else if (person.schedule[date] === 'available') {
			person.permissions = person.permissions + 1;
			person.schedule[date] = 'selected';
		} else if (person.schedule[date] === 'selected') {
			person.permissions = person.permissions - 1;
			person.schedule[date] = 'unavailable';
		} else if (person.schedule[date] === 'unavailable') {
			person.schedule[date] = undefined;
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
	}

	function autoFillPlanning() {
		const newPeople = [...people];

		newPeople.forEach((person) => {
			person.schedule = {};
			person.permissions = 0;
		});

		const allDates = weekDates.sort((a, b) => {
			const prefA = weekdayPreferences.find((p) => p.day === a.getDay())?.priority || 0;
			const prefB = weekdayPreferences.find((p) => p.day === b.getDay())?.priority || 0;
			return prefA - prefB;
		});

		allDates.forEach((date) => {
			const dateStr = date.toISOString().split('T')[0];

			const eligiblePerson = newPeople
				.filter((p) => !p.schedule[dateStr])
				.sort((a, b) => a.permissions - b.permissions)[0];

			if (eligiblePerson) {
				eligiblePerson.schedule[dateStr] = 'selected';
				eligiblePerson.permissions += 1;
			}
		});

		people = newPeople;
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
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
    </style>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="gradient-bg text-white py-6">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold">Permanence Planning</h1>
                <nav class="hidden md:flex space-x-6">
                    <a href="/permanence" class="hover:text-indigo-200 transition-colors">Current Month</a>
                    <a href="/" class="hover:text-indigo-200 transition-colors">Back to Home</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            <!-- Month Navigation -->
            <div class="bg-white rounded-lg planning-shadow mb-8 p-6">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex gap-2">
                        <button
                            on:click={getPreviousMonth}
                            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            ← Previous
                        </button>
                        <button
                            on:click={getNextMonth}
                            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
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
                <div class="overflow-x-auto rounded-lg planning-shadow">
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
                                <tr class="bg-white hover:bg-indigo-50 transition-colors">
                                    <td class="sticky left-0 bg-white border-r p-4 font-medium">
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
                                            <div class="mx-auto h-8 w-8 flex items-center justify-center rounded-full 
                                                {person.schedule[dateStr] === 'selected' ? 'bg-green-500' 
                                                : person.schedule[dateStr] === 'available' ? 'bg-blue-500' 
                                                : person.schedule[dateStr] === 'unavailable' ? 'bg-red-500' 
                                                : 'bg-gray-200'} text-white shadow-md">
                                                {person.schedule[dateStr] === 'selected' ? 'X' 
                                                 : person.schedule[dateStr] === 'available' ? 'O' 
                                                 : person.schedule[dateStr] === 'unavailable' ? '-' : ''}
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
            <div class="bg-white rounded-lg planning-shadow p-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Préférences des jours</h2>
                <p class="text-sm text-gray-600 mb-6">Glissez et déposez pour réorganiser par ordre de préférence</p>
                
                <div class="flex flex-wrap gap-3 mb-6">
                    {#each weekdayPreferences as pref, index (pref.day)}
                        <div
                            role="listitem"
                            draggable={true}
                            on:dragstart={(e) => handleDragStart(e, index)}
                            on:dragover={(e) => handleDragOver(e, index)}
                            on:dragend={handleDragEnd}
                            class="flex items-center gap-2 bg-indigo-50 rounded-lg px-4 py-2 border border-indigo-200 
                                   cursor-move hover:bg-indigo-100 transition-colors"
                        >
                            <span class="text-indigo-600 font-medium">{index + 1}.</span>
                            <span class="text-gray-700">{pref.name}</span>
                        </div>
                    {/each}
                </div>

                <button
                    on:click={autoFillPlanning}
                    class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
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
