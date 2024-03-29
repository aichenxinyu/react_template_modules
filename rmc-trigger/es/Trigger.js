import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import contains from 'rc-util/es/Dom/contains';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import Popup from './Popup';
import { getAlignFromPlacement, getPopupClassNameFromAlign } from './utils';
var IS_REACT_16 = !!React.createPortal;
function noop() {}
function returnEmptyString() {
    return '';
}
function returnDocument() {
    return window.document;
}

var Trigger = function (_React$Component) {
    _inherits(Trigger, _React$Component);

    function Trigger() {
        _classCallCheck(this, Trigger);

        var _this = _possibleConstructorReturn(this, (Trigger.__proto__ || Object.getPrototypeOf(Trigger)).apply(this, arguments));

        _this.onDocumentClick = function (event) {
            if (_this.props.mask && !_this.props.maskClosable) {
                return;
            }
            var target = event.target;
            var root = findDOMNode(_this);
            var popupNode = _this.getPopupDomNode();
            if (!contains(root, target) && !contains(popupNode, target)) {
                _this.close();
            }
        };
        _this.getPopupAlign = function () {
            var props = _this.props;
            var popupPlacement = props.popupPlacement,
                popupAlign = props.popupAlign,
                builtinPlacements = props.builtinPlacements;

            if (popupPlacement && builtinPlacements) {
                return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
            }
            return popupAlign;
        };
        _this.getRootDomNode = function () {
            return findDOMNode(_this);
        };
        _this.getPopupClassNameFromAlign = function (align) {
            var className = [];
            var props = _this.props;
            var popupPlacement = props.popupPlacement,
                builtinPlacements = props.builtinPlacements,
                prefixCls = props.prefixCls;

            if (popupPlacement && builtinPlacements) {
                className.push(getPopupClassNameFromAlign(builtinPlacements, prefixCls, align));
            }
            if (props.getPopupClassNameFromAlign) {
                className.push(props.getPopupClassNameFromAlign(align));
            }
            return className.join(' ');
        };
        _this.close = function () {
            if (_this.props.onClose) {
                _this.props.onClose();
            }
        };
        _this.onAnimateLeave = function () {
            if (_this.props.destroyPopupOnHide) {
                var container = _this._container;
                if (container) {
                    ReactDOM.unmountComponentAtNode(container);
                    container.parentNode.removeChild(container);
                }
            }
        };
        _this.removeContainer = function () {
            var container = document.querySelector('#' + _this.props.prefixCls + '-container');
            if (container) {
                ReactDOM.unmountComponentAtNode(container);
                container.parentNode.removeChild(container);
            }
        };
        return _this;
    }

    _createClass(Trigger, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.visible) {
                this.componentDidUpdate();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.props.visible) {
                if (!IS_REACT_16) {
                    this.renderDialog(false);
                }
            }
            this.clearOutsideHandler();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var _this2 = this;

            if (!IS_REACT_16) {
                this.renderDialog(this.props.visible);
            }
            if (this.props.visible) {
                                if (!this.touchOutsideHandler) {
                                                            this.touchOutsideHandler = setTimeout(function () {
                        var currentDocument = _this2.props.getDocument();
                        _this2.touchOutsideHandler = addEventListener(currentDocument, 'touchend', _this2.onDocumentClick);
                    });
                }
                return;
            }
            this.clearOutsideHandler();
        }
    }, {
        key: 'clearOutsideHandler',
        value: function clearOutsideHandler() {
            if (this.touchOutsideHandler) {
                this.touchOutsideHandler.remove();
                this.touchOutsideHandler = null;
            }
        }
    }, {
        key: 'getPopupDomNode',
        value: function getPopupDomNode() {
                        if (this._component && this._component.getPopupDomNode) {
                return this._component.getPopupDomNode();
            }
            return null;
        }
    }, {
        key: 'saveRef',
        value: function saveRef(el, visible) {
            this.popupRef = el;
            this._component = el;
            this.props.afterPopupVisibleChange(visible);
        }
    }, {
        key: 'getComponent',
        value: function getComponent(visible) {
            var _this3 = this;

            var props = _extends({}, this.props);
            ['visible', 'onAnimateLeave'].forEach(function (key) {
                if (props.hasOwnProperty(key)) {
                    delete props[key];
                }
            });
            return React.createElement(
                Popup,
                { key: 'popup', ref: function ref(el) {
                        return _this3.saveRef(el, visible);
                    }, prefixCls: props.prefixCls, destroyPopupOnHide: props.destroyPopupOnHide, visible: visible, className: props.popupClassName, align: this.getPopupAlign(), onAlign: props.onPopupAlign, animation: props.popupAnimation, getClassNameFromAlign: this.getPopupClassNameFromAlign, getRootDomNode: this.getRootDomNode, style: props.popupStyle, mask: props.mask, zIndex: props.zIndex, transitionName: props.popupTransitionName, maskAnimation: props.maskAnimation, maskTransitionName: props.maskTransitionName, onAnimateLeave: this.onAnimateLeave },
                typeof props.popup === 'function' ? props.popup() : props.popup
            );
        }
    }, {
        key: 'getContainer',
        value: function getContainer() {
            if (!this._container) {
                var props = this.props;
                var popupContainer = document.createElement('div');
                                                popupContainer.style.position = 'absolute';
                popupContainer.style.top = '0';
                popupContainer.style.left = '0';
                popupContainer.style.width = '100%';
                var mountNode = props.getPopupContainer ? props.getPopupContainer(findDOMNode(this)) : props.getDocument().body;
                mountNode.appendChild(popupContainer);
                this._container = popupContainer;
            }
            return this._container;
        }
    }, {
        key: 'renderDialog',
        value: function renderDialog(visible) {
            ReactDOM.unstable_renderSubtreeIntoContainer(this, this.getComponent(visible), this.getContainer());
        }
    }, {
        key: 'render',
        value: function render() {
            var props = this.props;
            var children = props.children;
            var child = React.Children.only(children);
            var newChildProps = {
                onClick: this.props.onTargetClick,
                key: 'trigger'
            };
            var trigger = React.cloneElement(child, newChildProps);
            if (!IS_REACT_16) {
                return trigger;
            }
            var portal = void 0;
                        if (props.visible || this._component) {
                portal = ReactDOM.createPortal(this.getComponent(props.visible), this.getContainer());
            }
            return [trigger, portal];
        }
    }]);

    return Trigger;
}(React.Component);

export default Trigger;

Trigger.defaultProps = {
    prefixCls: 'rc-trigger-popup',
    getPopupClassNameFromAlign: returnEmptyString,
    getDocument: returnDocument,
    onPopupVisibleChange: noop,
    afterPopupVisibleChange: noop,
    onPopupAlign: noop,
    popupClassName: '',
    popupStyle: {},
    destroyPopupOnHide: false,
    popupAlign: {},
    defaultPopupVisible: false,
    mask: false,
    maskClosable: true
};