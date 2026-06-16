const GROUPS_API = 'https://shspu.ru/sch_api/index.php?method=groups.get';

export async function getGroupId(groupName) {
    if (!groupName) return null;
    try {
        const res = await fetch(GROUPS_API);
        const data = await res.json();
        if (!data.ok) return null;

        const normalized = groupName.toUpperCase().replace(/\s/g, '');
        for (const faculty of data.result) {
            const group = faculty.groups.find(g => g.name.toUpperCase() === normalized);
            if (group) return group.id;
        }
        return null;
    } catch {
        return null;
    }
}
