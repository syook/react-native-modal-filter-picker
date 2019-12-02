import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, View, FlatList, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

import styles from './styles';

export default class ModalFilterPicker extends Component {
	static keyExtractor(_, index) {
		return index;
	}

	constructor(props, ctx) {
		super(props, ctx);

		this.state = {
			filter: '',
			showErrorMessage: false,
			ds: props.options,
		};
	}

	componentDidUpdate(prevProps) {
		if ((!prevProps.visible && this.props.visible) || prevProps.options !== this.props.options) {
			this.setState({
				showErrorMessage: false,
				ds: this.props.options,
			});
		}

		if (this.state.filter && this.props.errorMessage && !prevProps.errorMessage) {
			this.setState({
				showErrorMessage: true,
			});
		}
	}

	//on submitting option
	onClickSubmit = (text, onPressCreate) => {
		if (onPressCreate) {
			this.setState(
				{
					showErrorMessage: true,
				},
				onPressCreate(text)
			);
		}
	};

	onFilterChange = text => {
		const { options } = this.props;

		const filter = text.toLowerCase();

		// apply filter to incoming data
		const filtered = !filter.length
			? options
			: options.filter(
					({ searchKey, label }) =>
						label.toLowerCase().indexOf(filter) >= 0 ||
						(searchKey && searchKey.toLowerCase().indexOf(filter) >= 0)
			  );
		/* eslint react/no-unused-state:0 */
		this.setState({
			filter: text.toLowerCase(),
			ds: filtered,
		});
	};

	renderCreateButton = (text, onPressCreate, createButtonStyle, createButtonTextStyle) => (
		<View>
			<TouchableOpacity
				style={{ ...styles.createButton, ...createButtonStyle }}
				onPress={() => this.onClickSubmit(text, onPressCreate)}
			>
				<Text
					style={{
						...styles.createButtonText,
						...createButtonTextStyle,
					}}
				>{`Create '${text}'`}</Text>
			</TouchableOpacity>
		</View>
	);

	renderInputError = (inputErrorMessage, showErrorMessage) => {
		if (showErrorMessage && inputErrorMessage) {
			return <Text style={styles.errorMessage}>{inputErrorMessage}</Text>;
		}

		return null;
	};

	render() {
		const {
			title,
			titleTextStyle,
			overlayStyle,
			cancelContainerStyle,
			renderList,
			renderCancelButton,
			visible,
			modal,
			onCancel,
		} = this.props;

		const renderedTitle = !title ? null : <Text style={titleTextStyle || styles.titleTextStyle}>{title}</Text>;

		return (
			<Modal
				onRequestClose={onCancel}
				{...modal}
				visible={visible}
				supportedOrientations={['portrait', 'landscape']}
			>
				<KeyboardAvoidingView
					behavior="padding"
					style={overlayStyle || styles.overlay}
					enabled={Platform.OS === 'ios'}
				>
					<View>{renderedTitle}</View>
					{(renderList || this.renderList)()}
					<View style={cancelContainerStyle || styles.cancelContainer}>
						{(renderCancelButton || this.renderCancelButton)()}
					</View>
				</KeyboardAvoidingView>
			</Modal>
		);
	}

	renderList = () => {
		const {
			showFilter,
			listContainerStyle,
			androidUnderlineColor,
			placeholderText,
			placeholderTextColor,
			filterTextInputContainerStyle,
			filterTextInputStyle,
			autoFocus,
			inputErrorMessage,
		} = this.props;
		const filter = !showFilter ? null : (
			<View style={filterTextInputContainerStyle || styles.filterTextInputContainer}>
				<TextInput
					onChangeText={this.onFilterChange}
					autoCorrect={false}
					blurOnSubmit
					autoFocus={autoFocus}
					autoCapitalize="none"
					underlineColorAndroid={androidUnderlineColor}
					placeholderTextColor={placeholderTextColor}
					placeholder={placeholderText}
					style={filterTextInputStyle || styles.filterTextInput}
				/>
				{this.renderInputError(inputErrorMessage, this.state.showErrorMessage)}
			</View>
		);

		return (
			<View style={listContainerStyle || styles.listContainer}>
				{filter}
				{this.renderOptionList()}
			</View>
		);
	};

	renderOptionList = () => {
		const {
			noResultsText,
			flatListViewProps,
			keyExtractor,
			keyboardShouldPersistTaps,
			creatable,
			onClickCreate,
			createButtonStyle,
			createButtonTextStyle,
		} = this.props;

		const { ds } = this.state;

		if (!ds.length) {
			return (
				<FlatList
					keyboardShouldPersistTaps={keyboardShouldPersistTaps}
					enableEmptySections={false}
					data={[{ key: '_none' }]}
					keyExtractor={keyExtractor || this.keyExtractor}
					{...flatListViewProps}
					renderItem={() => (
						<View>
							{creatable ? (
								this.renderCreateButton(
									this.state.filter,
									onClickCreate,
									createButtonStyle,
									createButtonTextStyle
								)
							) : (
								<View style={styles.noResults}>
									<Text style={styles.noResultsText}>{noResultsText}</Text>
								</View>
							)}
						</View>
					)}
				/>
			);
		} else {
			return (
				<FlatList
					keyboardShouldPersistTaps={keyboardShouldPersistTaps}
					keyExtractor={keyExtractor || this.keyExtractor}
					{...flatListViewProps}
					data={ds}
					renderItem={this.renderOption}
				/>
			);
		}
	};

	renderOption = ({ item }) => {
		const { selectedOption, renderOption, optionTextStyle, selectedOptionTextStyle } = this.props;

		const { key, label } = item;

		let style = styles.optionStyle;
		let textStyle = optionTextStyle || styles.optionTextStyle;

		if (key === selectedOption) {
			style = styles.selectedOptionStyle;
			textStyle = selectedOptionTextStyle || styles.selectedOptionTextStyle;
		}

		if (renderOption) {
			return renderOption(item, key === selectedOption);
		}

		return (
			<TouchableOpacity activeOpacity={0.7} style={style} onPress={() => this.props.onSelect(key)}>
				<Text style={textStyle}>{label}</Text>
			</TouchableOpacity>
		);
	};

	renderCancelButton = () => {
		const { cancelButtonStyle, cancelButtonTextStyle, cancelButtonText } = this.props;

		return (
			<TouchableOpacity
				onPress={this.props.onCancel}
				activeOpacity={0.7}
				style={cancelButtonStyle || styles.cancelButton}
			>
				<Text style={cancelButtonTextStyle || styles.cancelButtonText}>{cancelButtonText}</Text>
			</TouchableOpacity>
		);
	};
}

ModalFilterPicker.propTypes = {
	options: PropTypes.array.isRequired,
	onSelect: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	placeholderText: PropTypes.string,
	placeholderTextColor: PropTypes.string,
	androidUnderlineColor: PropTypes.string,
	cancelButtonText: PropTypes.string,
	title: PropTypes.string,
	noResultsText: PropTypes.string,
	visible: PropTypes.bool,
	showFilter: PropTypes.bool,
	modal: PropTypes.object,
	selectedOption: PropTypes.string,
	renderOption: PropTypes.func,
	renderCancelButton: PropTypes.func,
	renderList: PropTypes.func,
	flatListViewProps: PropTypes.object,
	filterTextInputContainerStyle: PropTypes.any,
	filterTextInputStyle: PropTypes.any,
	cancelContainerStyle: PropTypes.any,
	cancelButtonStyle: PropTypes.any,
	cancelButtonTextStyle: PropTypes.any,
	titleTextStyle: PropTypes.any,
	overlayStyle: PropTypes.any,
	listContainerStyle: PropTypes.any,
	optionTextStyle: PropTypes.any,
	selectedOptionTextStyle: PropTypes.any,
	createButtonStyle: PropTypes.any,
	createButtonTextStyle: PropTypes.any,
	keyboardShouldPersistTaps: PropTypes.string,
	creatable: PropTypes.bool,
	onPressCreate: PropTypes.func,
	autoFocus: PropTypes.any,
};

ModalFilterPicker.defaultProps = {
	placeholderText: 'Filter...',
	placeholderTextColor: '#ccc',
	androidUnderlineColor: 'rgba(0,0,0,0)',
	cancelButtonText: 'Cancel',
	noResultsText: 'No matches',
	visible: true,
	showFilter: true,
	creatable: false,
	createButtonStyle: {},
	createButtonTextStyle: {},
	keyboardShouldPersistTaps: 'never',
};
