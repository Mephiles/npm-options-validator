export default class OptionsValidator {
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
			OptionsValidator.ValidateRequired(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateMinValue(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateMaxValue(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateMinLength(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateMaxLength(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateAcceptedValues(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateNotAcceptedValues(OPTIONS, TEMPLATE, key);
			OptionsValidator.ValidateRegexFormat(OPTIONS, TEMPLATE, key);
		}
	}

	static ValidateType(OPTIONS, TEMPLATE, key) {
		if (typeof TEMPLATE[key] !== 'object') {
			if (
				(TEMPLATE[key] === 'list' && OptionsValidator.ListIsCorrect(TEMPLATE[key], OPTIONS[key])) ||
				(TEMPLATE[key] === 'file-path' && OptionsValidator.IsFilePath(key, OPTIONS[key]))(
					TEMPLATE[key] === 'folder-path' && OptionsValidator.IsFolderPath(key, OPTIONS[key])
				) ||
				TEMPLATE[key] !== typeof OPTIONS[key]
			) {
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

	static ValidateRequired(OPTIONS, TEMPLATE, key) {
		if (TEMPLATE[key].required === undefined) {
			return;
		}
		if (TEMPLATE[key].required === true && key in OPTIONS) {
			return;
		}

		throw new OptionsValidatorException(`Key'${key}' requires a value.`);
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

	static ValidateNotAcceptedValues(OPTIONS, TEMPLATE, key) {
		if (TEMPLATE[key].notAcceptedValues === undefined) {
			return;
		}
		if (!TEMPLATE[key].notAcceptedValues.includes(OPTIONS[key])) {
			return;
		}

		throw new OptionsValidatorException(`Value '${OPTIONS[key]}' is not allowed as an option for '${key}'.`);
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

	// Helper functions

	static IsFolderPath(key, path) {
		const regexTester = new RegExp(/^(\/{1}|[A-Za-z]{1})([A-Za-z0-9\/]*)$/);
		if (regexTester.test(path)) {
			return;
		}

		throw new OptionsValidatorException(`'${path}' is not a valid folder path for '${key}'.`);
	}

	static IsFilePath(key, path) {
		const regexTester = new RegExp(/^(\/{1}|[A-Za-z]{1})([A-Za-z0-9\/]*)\.([A-Z-a-z]{1,})$/);
		if (regexTester.test(path)) {
			return;
		}

		throw new OptionsValidatorException(`'${path}' is not a valid file path for '${key}'.`);
	}

	static ListIsCorrect(template, list) {
		if (!Array.isArray(list)) {
			return false;
		}

		if ('listContents' in template && !OptionsValidator.ListItemsAreCorrect(template.listContents, list)) {
			return false;
		}
		return true;
	}

	static ListItemsAreCorrect(itemType, list) {
		for (const item of list) {
			switch (itemType) {
				case 'folder-path':
					if (!OptionsValidator.IsFolderPath(item)) {
						return false;
					}
					break;
				case 'file-path':
					if (!OptionsValidator.IsFilePath(item)) {
						return false;
					}
					break;
				case 'object':
					//TODO: Might need to do something special here some day
					break;
				default:
					if (typeof item !== itemType) {
						return false;
					}
			}
		}
		return true;
	}
}

class OptionsValidatorException extends Error {
	constructor(message) {
		super(message);
		this.name = 'OptionsValidatorException';
	}
}
