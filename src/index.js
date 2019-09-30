import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
	Modal,
	View,
	ListView,
	TouchableOpacity,
	Text,
	TextInput,
	KeyboardAvoidingView,
	Platform
} from 'react-native'

import styles from './styles'

export default class ModalFilterPicker extends Component {
	constructor(props, ctx) {
		super(props, ctx)

		this.state = {
			filter: '',
			ds: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1.key !== r2.key
			}).cloneWithRows(props.options)
		}
	}

	componentDidUpdate(prevProps) {
		if (
			(!prevProps.visible && this.props.visible) ||
			prevProps.options !== this.props.options
		) {
			this.setState({
				filter: '',
				ds: this.state.ds.cloneWithRows(this.props.options)
			})
		}
	}

	renderCreateButton = (text, onPressCreate, createButtonStyle, createButtonTextStyle) => (
		<View>
			<TouchableOpacity
				style={{...styles.createButton, ...createButtonStyle}}
				onPress={() => onPressCreate && onPressCreate(text)}>
				<Text style={{...styles.createButtonText, ...createButtonTextStyle}}>{`Create '${text}'`}</Text>
			</TouchableOpacity>
		</View>
	)

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
			onCancel
		} = this.props

		const renderedTitle = !title ? null : (
			<Text style={titleTextStyle || styles.titleTextStyle}>{title}</Text>
		)

		return (
			<Modal
				onRequestClose={onCancel}
				{...modal}
				visible={visible}
				supportedOrientations={['portrait', 'landscape']}>
				<KeyboardAvoidingView
					behavior="padding"
					style={overlayStyle || styles.overlay}
					enabled={Platform.OS === 'ios'}>
					<View>{renderedTitle}</View>
					{(renderList || this.renderList)()}
					<View style={cancelContainerStyle || styles.cancelContainer}>
						{(renderCancelButton || this.renderCancelButton)()}
					</View>
				</KeyboardAvoidingView>
			</Modal>
		)
	}

	renderList = () => {
		const {
			showFilter,
			autoFocus,
			listContainerStyle,
			androidUnderlineColor,
			placeholderText,
			placeholderTextColor,
			filterTextInputContainerStyle,
			filterTextInputStyle
		} = this.props

		const filter = !showFilter ? null : (
			<View
				style={
					filterTextInputContainerStyle || styles.filterTextInputContainer
				}>
				<TextInput
					onChangeText={this.onFilterChange}
					autoCorrect={false}
					blurOnSubmit={true}
					autoFocus={autoFocus}
					autoCapitalize="none"
					underlineColorAndroid={androidUnderlineColor}
					placeholderTextColor={placeholderTextColor}
					placeholder={placeholderText}
					style={filterTextInputStyle || styles.filterTextInput}
				/>
			</View>
		)

		return (
			<View style={listContainerStyle || styles.listContainer}>
				{filter}
				{this.renderOptionList()}
			</View>
		)
	}

	renderOptionList = () => {
		const {
			noResultsText,
			listViewProps,
			keyboardShouldPersistTaps,
			creatable,
			onClickCreate,
			createButtonStyle,
			createButtonTextStyle
		} = this.props

		const { ds } = this.state

		if (1 > ds.getRowCount()) {
			return (
				<ListView
					enableEmptySections={false}
					{...listViewProps}
					dataSource={ds.cloneWithRows([{ key: '_none' }])}
					renderRow={() => (
						<View>
							{creatable ? (
								this.renderCreateButton(this.state.filter, onClickCreate, createButtonStyle, createButtonTextStyle)
							) : (
								<View style={styles.noResults}>
									<Text style={styles.noResultsText}>{noResultsText}</Text>
								</View>
							)}
						</View>
					)}
				/>
			)
		} else {
			return (
				<ListView
					enableEmptySections={false}
					{...listViewProps}
					dataSource={ds}
					renderRow={this.renderOption}
					keyboardShouldPersistTaps={keyboardShouldPersistTaps}
				/>
			)
		}
	}

	renderOption = rowData => {
		const {
			selectedOption,
			renderOption,
			optionTextStyle,
			selectedOptionTextStyle
		} = this.props

		const { key, label } = rowData

		let style = styles.optionStyle
		let textStyle = optionTextStyle || styles.optionTextStyle

		if (key === selectedOption) {
			style = styles.selectedOptionStyle
			textStyle = selectedOptionTextStyle || styles.selectedOptionTextStyle
		}

		if (renderOption) {
			return renderOption(rowData, key === selectedOption)
		} else {
			return (
				<TouchableOpacity
					activeOpacity={0.7}
					style={style}
					onPress={() => this.props.onSelect(key)}>
					<Text style={textStyle}>{label}</Text>
				</TouchableOpacity>
			)
		}
	}

	renderCancelButton = () => {
		const {
			cancelButtonStyle,
			cancelButtonTextStyle,
			cancelButtonText
		} = this.props

		return (
			<TouchableOpacity
				onPress={this.props.onCancel}
				activeOpacity={0.7}
				style={cancelButtonStyle || styles.cancelButton}>
				<Text style={cancelButtonTextStyle || styles.cancelButtonText}>
					{cancelButtonText}
				</Text>
			</TouchableOpacity>
		)
	}

	onFilterChange = text => {
		const { options } = this.props

		const filter = text.toLowerCase()

		// apply filter to incoming data
		const filtered = !filter.length
			? options
			: options.filter(
					({ searchKey, label, key }) =>
						0 <= label.toLowerCase().indexOf(filter) ||
						(searchKey && 0 <= searchKey.toLowerCase().indexOf(filter))
			  )

		this.setState({
			filter: text,
			ds: this.state.ds.cloneWithRows(filtered)
		})
	}
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
	listViewProps: PropTypes.object,
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
}

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
	keyboardShouldPersistTaps: 'never'
}
