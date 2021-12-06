import * as _ from 'lodash';
import React from 'react';
// @ts-ignore
import AsyncCreatableSelect from 'react-select/async-creatable';
import debounce from 'debounce-promise';
import { withSetup } from './SetupProvider';

const formatCreateLabel = (value: string) => {
	return `Use "${value}"`;
};

// TODO: Make this an SDK method
// Generates a schema that will pattern match a field on a specific card type
const generateKeyPathQuerySchema = (
	keyPath: any,
	resource: any,
	value: any,
	isArray: boolean,
) => {
	// If the type isn't versioned, default to 1.0.0
	const type = resource.match('@') ? resource : `${resource}@1.0.0`;

	const schema = {
		type: 'object',
		description: `Find by pattern on type ${type}`,
		properties: {
			active: {
				const: true,
			},
			type: {
				const: type,
			},
		},
		required: ['type', 'active'],
	};

	const keyPathParts = keyPath.split('.');

	// Set a case insensitive pattern match schema at the location specified in
	// the keypath
	const schemaKeyPath = `properties.${keyPathParts.join('.properties.')}`;

	const patternSchema = {
		regexp: {
			pattern: value,
			flags: 'i',
		},
	};

	if (isArray) {
		_.set(schema, schemaKeyPath, {
			type: 'array',
			items: patternSchema,
		});
	} else {
		_.set(schema, schemaKeyPath, patternSchema);
	}

	// Ensure that each subfield in the schema is marked as required
	let node = schema;

	for (const key of keyPathParts) {
		if (!node.required) {
			node.required = [];
		}

		node.required.push(key);

		// @ts-ignore
		node = node.properties[key];
	}

	return schema;
};

class AutoCompleteWidget extends React.Component<any> {
	constructor(props: any) {
		super(props);

		this.getTargets = debounce(this.getTargets.bind(this), 500);
		this.onChange = this.onChange.bind(this);
	}

	onChange(option: any) {
		this.props.onChange(option === null ? null : option.value);
	}

	async getTargets(value: any) {
		try {
			const { props } = this;

			// If the keypath ends in a dash, this indicates that the keypath should be searched as an array
			const isArray = props.options.keypath.slice(-2) === '.-';

			const keyPath = isArray
				? props.options.keypath.slice(0, -2)
				: props.options.keypath;

			const schema = generateKeyPathQuerySchema(
				keyPath,
				props.options.resource,
				value,
				isArray,
			);

			const results = await props.sdk.query(schema);

			return _.uniq(_.flatMap(results, props.options.keyPath))
				.filter((res: any) => {
					return res.includes(value);
				})
				.map((repo) => {
					return {
						value: repo,
						label: repo,
					};
				});
		} catch (err) {
			console.error(err);
			return [];
		}
	}

	render() {
		const { props } = this;

		const selectedValue = props.value
			? {
					value: props.value,
					label: props.value,
			  }
			: null;

		return (
			<AsyncCreatableSelect
				classNamePrefix="jellyfish-async-select"
				value={selectedValue}
				isClearable
				cacheOptions
				onChange={this.onChange}
				loadOptions={this.getTargets}
				formatCreateLabel={formatCreateLabel}
			/>
		);
	}
}

export default withSetup(AutoCompleteWidget);
