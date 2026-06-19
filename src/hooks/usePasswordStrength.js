import { useMemo } from 'react';
import { getPasswordStrength, getPasswordStrengthText } from '@utils/validators';

const usePasswordStrength = (password) => {
	return useMemo(() => {
		if (password) {
			const s = getPasswordStrength(password);
			return { strength: s, strengthText: getPasswordStrengthText(s) };
		}
		return { strength: 0, strengthText: '' };
	}, [password]);
};

export default usePasswordStrength;
