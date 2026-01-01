import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SettingControl from '../components/Settings/SettingControl'
import { useSettingsStore, Setting } from '../store/useSettingsStore'

// Mock the settings store
vi.mock('../store/useSettingsStore', () => ({
  useSettingsStore: vi.fn(),
  Setting: {} as any
}))

describe('SettingControl', () => {
  const mockUpdateSetting = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSettingsStore as any).mockReturnValue({
      settings: {},
      updateSetting: mockUpdateSetting
    })
  })

  describe('ToggleControl', () => {
    const toggleSetting: Setting = {
      id: 'test.toggle',
      type: 'toggle',
      label: 'Enable Feature',
      description: 'Turn this feature on or off',
      defaultValue: false
    }

    it('should render toggle control with label and description', () => {
      render(<SettingControl setting={toggleSetting} />)

      expect(screen.getByText('Enable Feature')).toBeInTheDocument()
      expect(screen.getByText('Turn this feature on or off')).toBeInTheDocument()
    })

    it('should show "New in" badge when addedInVersion is present', () => {
      const settingWithVersion = { ...toggleSetting, addedInVersion: 'v1.7.0' }
      render(<SettingControl setting={settingWithVersion} />)

      expect(screen.getByText('New in v1.7.0')).toBeInTheDocument()
    })

    it('should display current value from store', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.toggle': true },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={toggleSetting} />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('should use default value when not in store', () => {
      render(<SettingControl setting={toggleSetting} />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')
    })

    it('should call updateSetting when toggled', () => {
      render(<SettingControl setting={toggleSetting} />)

      const toggle = screen.getByRole('switch')
      fireEvent.click(toggle)

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.toggle', true)
    })

    it('should toggle from true to false', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.toggle': true },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={toggleSetting} />)

      const toggle = screen.getByRole('switch')
      fireEvent.click(toggle)

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.toggle', false)
    })
  })

  describe('SelectControl', () => {
    const selectSetting: Setting = {
      id: 'test.select',
      type: 'select',
      label: 'Choose Option',
      description: 'Select from available options',
      defaultValue: 'option1',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ]
    }

    it('should render select control with all options', () => {
      render(<SettingControl setting={selectSetting} />)

      expect(screen.getByText('Choose Option')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.options).toHaveLength(3)
      expect(select.options[0].text).toBe('Option 1')
      expect(select.options[1].text).toBe('Option 2')
      expect(select.options[2].text).toBe('Option 3')
    })

    it('should display current value', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.select': 'option2' },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={selectSetting} />)

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('option2')
    })

    it('should call updateSetting when changed', () => {
      render(<SettingControl setting={selectSetting} />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'option3' } })

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.select', 'option3')
    })
  })

  describe('TextControl', () => {
    const textSetting: Setting = {
      id: 'test.text',
      type: 'text',
      label: 'Text Input',
      description: 'Enter some text',
      defaultValue: ''
    }

    it('should render text input', () => {
      render(<SettingControl setting={textSetting} />)

      expect(screen.getByText('Text Input')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should display current value', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.text': 'Hello World' },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={textSetting} />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Hello World')
    })

    it('should call updateSetting on change', () => {
      render(<SettingControl setting={textSetting} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'New Text' } })

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.text', 'New Text')
    })
  })

  describe('NumberControl', () => {
    const numberSetting: Setting = {
      id: 'test.number',
      type: 'number',
      label: 'Number Input',
      description: 'Enter a number',
      defaultValue: 10
    }

    it('should render number input with increment/decrement buttons', () => {
      render(<SettingControl setting={numberSetting} />)

      expect(screen.getByText('Number Input')).toBeInTheDocument()
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
      expect(screen.getByText('−')).toBeInTheDocument() // Decrement
      expect(screen.getByText('+')).toBeInTheDocument() // Increment
    })

    it('should display current value', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.number': 42 },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={numberSetting} />)

      const input = screen.getByRole('spinbutton') as HTMLInputElement
      expect(input.value).toBe('42')
    })

    it('should call updateSetting when manually changed', () => {
      render(<SettingControl setting={numberSetting} />)

      const input = screen.getByRole('spinbutton')
      fireEvent.change(input, { target: { value: '25' } })

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.number', 25)
    })

    it('should increment value when + button clicked', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.number': 10 },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={numberSetting} />)

      const incrementBtn = screen.getByText('+')
      fireEvent.click(incrementBtn)

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.number', 11)
    })

    it('should decrement value when - button clicked', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.number': 10 },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={numberSetting} />)

      const decrementBtn = screen.getByText('−')
      fireEvent.click(decrementBtn)

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.number', 9)
    })

    it('should handle invalid input by converting to 0', () => {
      render(<SettingControl setting={numberSetting} />)

      const input = screen.getByRole('spinbutton')
      fireEvent.change(input, { target: { value: 'abc' } })

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.number', 0)
    })
  })

  describe('ColorControl', () => {
    const colorSetting: Setting = {
      id: 'test.color',
      type: 'color',
      label: 'Color Picker',
      description: 'Choose a color',
      defaultValue: '#3b82f6'
    }

    it('should render color input with preview and text input', () => {
      render(<SettingControl setting={colorSetting} />)

      expect(screen.getByText('Color Picker')).toBeInTheDocument()
      expect(screen.getByLabelText('Color Picker color picker')).toBeInTheDocument()
    })

    it('should display current color in preview', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.color': '#ff0000' },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={colorSetting} />)

      const preview = screen.getByLabelText('Color Picker color picker')
      expect(preview).toHaveStyle({ backgroundColor: '#ff0000' })
    })

    it('should call updateSetting when hex input changed', () => {
      render(<SettingControl setting={colorSetting} />)

      const hexInputs = screen.getAllByRole('textbox')
      const hexInput = hexInputs.find(input => (input as HTMLInputElement).value.startsWith('#'))

      fireEvent.change(hexInput!, { target: { value: '#00ff00' } })

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.color', '#00ff00')
    })
  })

  describe('GalleryControl', () => {
    const gallerySetting: Setting = {
      id: 'test.gallery',
      type: 'gallery',
      label: 'Gallery Selector',
      description: 'Choose from gallery',
      defaultValue: 'item1',
      options: [
        { label: 'Item 1', value: 'item1', description: 'First item' },
        { label: 'Item 2', value: 'item2', description: 'Second item' },
        { label: 'Item 3', value: 'item3', description: 'Third item' }
      ]
    }

    it('should render gallery with 3-column grid', () => {
      render(<SettingControl setting={gallerySetting} />)

      expect(screen.getByText('Gallery Selector')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should show checkmark on selected item', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.gallery': 'item2' },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={gallerySetting} />)

      const item2Button = screen.getByText('Item 2').closest('button')
      expect(item2Button).toHaveClass('border-blue-500')
    })

    it('should call updateSetting when item clicked', () => {
      render(<SettingControl setting={gallerySetting} />)

      const item3Button = screen.getByText('Item 3').closest('button')
      fireEvent.click(item3Button!)

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.gallery', 'item3')
    })
  })

  describe('KeymapControl', () => {
    const keymapSetting: Setting = {
      id: 'test.keymap',
      type: 'keymap',
      label: 'Keyboard Shortcut',
      description: 'Record a shortcut',
      defaultValue: ''
    }

    it('should render keymap recorder', () => {
      render(<SettingControl setting={keymapSetting} />)

      expect(screen.getByText('Keyboard Shortcut')).toBeInTheDocument()
      expect(screen.getByText('Not set')).toBeInTheDocument()
    })

    it('should display current shortcut', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.keymap': '⌘⇧P' },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={keymapSetting} />)

      expect(screen.getByText('⌘⇧P')).toBeInTheDocument()
    })

    it('should enter recording mode when clicked', () => {
      render(<SettingControl setting={keymapSetting} />)

      const input = screen.getByText('Not set')
      fireEvent.click(input)

      expect(screen.getByText('Press shortcut...')).toBeInTheDocument()
    })

    it('should record keyboard shortcut', () => {
      render(<SettingControl setting={keymapSetting} />)

      const input = screen.getByText('Not set')
      fireEvent.click(input)

      fireEvent.keyDown(input, { metaKey: true, altKey: true, key: '1' })

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.keymap', '⌘⌥1')
    })

    it('should show Clear button when shortcut is set', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.keymap': '⌘⇧P' },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={keymapSetting} />)

      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('should clear shortcut when Clear clicked', () => {
      ;(useSettingsStore as any).mockReturnValue({
        settings: { 'test.keymap': '⌘⇧P' },
        updateSetting: mockUpdateSetting
      })

      render(<SettingControl setting={keymapSetting} />)

      const clearBtn = screen.getByText('Clear')
      fireEvent.click(clearBtn)

      expect(mockUpdateSetting).toHaveBeenCalledWith('test.keymap', '')
    })
  })

  describe('Unknown Type', () => {
    it('should show error message for unknown setting type', () => {
      const unknownSetting = {
        id: 'test.unknown',
        type: 'invalid' as any,
        label: 'Unknown',
        defaultValue: null
      }

      render(<SettingControl setting={unknownSetting} />)

      expect(screen.getByText('Unknown setting type: invalid')).toBeInTheDocument()
    })
  })
})
