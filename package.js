class OptionsValidator {
	TEMPLATE;
	OPTIONS;

	constructor(optionsTemplate, options) {
		this.TEMPLATE = optionsTemplate;
		this.OPTIONS = options;
		OptionsValidator.ValidateOptions(this.OPTIONS, this.TEMPLATE);
	}

	ToObject() {
		return this.OPTIONS;
	}

	static ValidateOptions(OPTIONS, TEMPLATE) {
		if (typeof OPTIONS !== 'object' || Array.isArray(OPTIONS)) {
			return;
		}

		for (const key in OPTIONS) {
			if (!(key in TEMPLATE)) {
				continue;
			}

			OptionsValidator.ValidateType(OPTIONS, TEMPLATE, key);
			if (typeof TEMPLATE[key] !== 'object') {
				continue;
			} else if (!OptionsValidator.ObjectIsOptionsObject(key)) {
				return OptionsValidator.ValidateOptions(OPTIONS[key], TEMPLATE[key]);
			}
			OptionsValidator.ValidateMinValue(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateMaxValue(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateMinLength(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateMaxLength(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateAcceptedValues(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateRegexFormat(OPTIONS, TEMPLATE, key);
		}
	}

	static ValidateType(OPTIONS, TEMPLATE, key) {
		if (typeof TEMPLATE[key] !== 'object') {
			if (TEMPLATE[key] !== typeof OPTIONS[key]) {
				throw new OptionsValidatorException(
					`Value of '${key}' was expected to be of type '${
						TEMPLATE[key][0].toUpperCase() + TEMPLATE[key].slice(1)
					}'.`
				);
			}
		} else {
			if (TEMPLATE[key].type === undefined) {
				throw new OptionsValidatorException(`Template option 'type' cannot be 'undefined'.`);
			} else if (TEMPLATE[key].type !== OPTIONS[key]) {
				throw new OptionsValidatorException(
					`Value of '${key}' was expected to be of type '${
						TEMPLATE[key][0].toUpperCase() + TEMPLATE[key].slice(1)
					}'.`
				);
			}
		}
	}

	static ValidateMinValue(OPTIONS, TEMPLATE, key) {
		if (TEMPLATE[key].minValue === undefined) {
			return;
		}
		if (TEMPLATE[key].minValue <= OPTIONS[key]) {
			return;
		}

		throw new OptionsValidatorException(`Value of '${key}' cannot be ${TEMPLATE[key].minValue - 1} or less.`);
	}

	static ValidateMaxValue(OPTIONS, TEMPLATE, key) {
		if (TEMPLATE[key].maxValue === undefined) {
			return;
		}
		if (TEMPLATE[key].maxValue >= OPTIONS[key]) {
			return;
		}

		throw new OptionsValidatorException(`Value of '${key}' cannot be ${TEMPLATE[key].maxValue + 1} or more.`);
	}

	static ValidateMinLength(OPTIONS, TEMPLATE, key) {
		if (TEMPLATE[key].minLength === undefined) {
			return;
		}
		if (TEMPLATE[key].minLength <= OPTIONS[key]) {
			return;
		}

		throw new OptionsValidatorException(`Length of '${key}' cannot be ${TEMPLATE[key].minValue - 1} or less.`);
	}

	static ValidateMaxLength(OPTIONS, TEMPLATE, key) {
		if (TEMPLATE[key].maxLength === undefined) {
			return;
		}
		if (TEMPLATE[key].maxLength >= OPTIONS[key]) {
			return;
		}

		throw new OptionsValidatorException(`Length of '${key}' cannot be ${TEMPLATE[key].maxLength + 1} or more.`);
	}

	static ValidateAcceptedValues(OPTIONS, TEMPLATE, key) {
		if (TEMPLATE[key].acceptedValues === undefined) {
			return;
		}
		if (TEMPLATE[key].acceptedValues.includes(OPTIONS[key])) {
			return;
		}

		throw new OptionsValidatorException(
			`Value '${OPTIONS[key]}' is not a valid option for '${key}'. Valid options are: ${TEMPLATE[
				key
			].acceptedValues.join(', ')}.`
		);
	}

	static ValidateRegexFormat(OPTIONS, TEMPLATE, key) {
		if (TEMPLATE[key].regexFormat === undefined) {
			return;
		}
		const regexTester = new RegExp(TEMPLATE[key].regexFormat);
		if (regexTester.test(OPTIONS[key])) {
			return;
		}

		throw new OptionsValidatorException(`Value of '${key}' does not match expected format.`);
	}
}

class OptionsValidatorException extends Error {
	constructor(message) {
		super(message);
		this.name = 'OptionsValidatorException';
	}
}

module.exports = OptionsValidator;
