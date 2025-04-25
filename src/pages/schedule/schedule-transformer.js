// scheduleTransformer.js
export const transformScheduleData = (originalData) => {
    if (!Array.isArray(originalData)) {
        return [];
    }

    const FILTERED_PHRASES = [
        "День самостоятельной работы",
        "Праздничный день",
        "Проектная среда",
    ];

    const shouldFilterPair = (pairText) => {
        return FILTERED_PHRASES.some((phrase) =>
            pairText.replace(/\s*\/\s*/g, " ").includes(phrase)
        );
    };

    const parsePairText = (text) => {
        const normalizedText = text.replace(/\s*\/\s*/g, " / ");
        const parts = normalizedText.split(" / ").map((part) => part.trim());

        if (parts.length < 2) {
            return null;
        }

        let teachersPart = "";
        let subjectPart = "";
        let typePart = "";
        let roomPart = "";

        const typeIndex = parts.findIndex((part) => /\([а-яa-z]\d+\)/i.test(part));

        if (typeIndex !== -1) {
            teachersPart = parts.slice(0, typeIndex).join(" / ");
            const remainingParts = parts.slice(typeIndex);

            const typeMatch = remainingParts[0].match(/\(([а-яa-z]\d+)\)/i);
            typePart = typeMatch ? typeMatch[1] : "";

            subjectPart = remainingParts[0].split("(")[0].trim();

            const roomCandidate1 = remainingParts[0].includes(")")
                ? remainingParts[0].split(")")[1].trim()
                : "";

            const roomCandidate2 = remainingParts.length > 1 ? remainingParts[1] : "";

            roomPart = roomCandidate1 || roomCandidate2;
        } else {
            teachersPart = parts[0];
            subjectPart = parts[1];
            roomPart = parts.length > 2 ? parts[2] : "";
        }

        roomPart = roomPart.replace(/^[^а-яa-z0-9]*|[^а-яa-z0-9]*$/gi, "");

        return {
            teachers: teachersPart,
            subject: subjectPart,
            type: typePart,
            room: roomPart,
            originalText: text,
        };
    };

    const transformedData = originalData
        .map((dayData) => {
            const filteredPairs = dayData.pairs
                .filter((pair) => !shouldFilterPair(pair.text))
                .map((pair) => {
                    const parsed = parsePairText(pair.text);
                    return parsed
                        ? {
                            number: pair.num,
                            ...parsed,
                        }
                        : null;
                })
                .filter(Boolean);

            return {
                date: dayData.date,
                pairs: filteredPairs,
            };
        })
        .filter((dayData) => dayData.pairs.length > 0);

    return transformedData;
};
