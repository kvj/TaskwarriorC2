import React from 'react';
import {styles, _l} from '../styles/main';

export const eventInfo = (e) => {
    if (!e) return undefined;
    return {
        shift: e.shiftKey || false,
        ctrl: e.ctrlKey || false,
        alt: e.altKey || false,
        meta: e.metaKey || false,
        key: e.charCode || e.keyCode,
        stop: () => {
            e.stopPropagation();
        },
    }
};

export const LoadingIndicator = (props) => {
    return (
        <div style={_l(styles.loadingIndicator)}>
            <i className="fa fa-circle-o-notch fa-spin fa-fw"></i>
        </div>
    );
};

export const Div = (props) => {
    return (<div {...props}>{props.children}</div>)
};

export const IconBtn = (props) => {
    return (
        <button
            style={_l([styles.btn])}
            onClick={(evt) => {
                if (props.onClick) props.onClick(eventInfo(evt));
            }}
            title={props.title}
        >
            <i className={`fa fa-fw fa-${props.icon}`}></i>
        </button>
    );
}

export class IconMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {expanded: false};
    }

    render() {
        const {children, dir, style} = this.props;
        const {expanded} = this.state;
        let menu = null;
        let st = [styles.hflex, styles.menu];
        let wst = [styles.hflex, styles.menu_popup];
        if (style && style.length) { // Copy
            st = st.concat(style);
            wst = wst.concat(style);
        };
        if (expanded) { // Render
            menu = (
                <div style={_l(styles.flex0, styles.menu_wrap)}>
                    <div
                        onMouseLeave={this.onMenuHide.bind(this)}
                        onClick={this.onMenuHide.bind(this)}
                        style={_l(wst)}
                    >
                        {children}
                    </div>
                </div>
            );
        };
        return (
            <div style={_l(st)}>
                {menu}
                <IconBtn
                    icon={expanded? 'caret-right': 'caret-left'}
                    onClick={this.onMenu.bind(this)}
                />
            </div>
        );
    }

    onMenu() {
        this.setState({
            expanded: !this.state.expanded,
        });
    }

    onMenuHide() {
        this.setState({
            expanded: false,
        });
    }
}

export const Text = (props) => {
    let _st = [styles.flex0, styles.text];
    if (props.style && props.style.length) {
        _st = _st.concat(props.style);
    }
    const val = props.children || '';
    let sfx = ''
    while (props.width > val.length+sfx.length) {
        sfx += ' ';
    }
    let editIcn = null;
    if (props.editable === true) {
        editIcn = (
            <i
                className="fa fa-fw fa-pencil text-edit"
                style={styles.text_edit}
                onClick={(evt) => {
                    props.onEdit && props.onEdit(eventInfo(evt));
                }}
            >
            </i>
        )
    } else if (props.editable === false) {
        editIcn = (
            <i className="fa fa-fw" style={styles.text_edit}></i>
        )
    }
    let onDrag = undefined;
    let draggable = false;
    if (props.onDrag) { // Enable drag
        onDrag = (e) => {
            const [type, value, text] = props.onDrag(e);
            if (type && value) { // Start drag
                e.dataTransfer.setData('text/plain', text || value);
                e.dataTransfer.setData(type, value);
            };
        };
        draggable = true;
    };
    return (
        <div style={_l(_st)} title={props.title || val} className="text-wrap" onClick={(evt) => {
            if (props.onClick) props.onClick(eventInfo(evt));
        }}>
            <span
                className="text"
                draggable={draggable}
                onDragStart={onDrag}
            >
                {val}
            </span>
            {editIcn}
            <span>{sfx}</span>
        </div>
    );
}

export class DnD extends React.Component {

    constructor(props) {
        super(props);
        this.dropCount = 0;
        this.dropTypes = [];
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragFinish = this.onDragFinish.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    hasData(e) {
        for (let type of e.dataTransfer.types) {
            if (this.dropTypes.includes(type)) { // OK
                return type;
            };
        }
        return undefined;
    }

    onDragStart(e) {
        if (!this.hasData(e)) return;
        this.dropCount += 1;
        if (this.dropCount == 1) { // First
            this.setState({
                dragTarget: true,
            });
        };
        e.preventDefault();
    }

    onDragOver(e) {
        if (!this.hasData(e)) return;
        e.preventDefault();
    }

    onDragFinish(e) {
        if (!this.hasData(e)) return;
        this.dropCount -= 1;
        if (this.dropCount == 0) { // Last
            this.setState({
                dragTarget: false,
            });
        };
        e.preventDefault();
    }

    onDrop(e) {
        const type = this.hasData(e);
        if (!type) return;
        this.dropCount = 0;
        this.setState({
            dragTarget: false,
        });
        this.onDropHandler(type, e.dataTransfer.getData(type), e);
        e.preventDefault();
    }

    onDropHandler(type, data) {
    }

}

export class CmdPageInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cmd: props.cmd || '',
        };
    }

    onChange (evt) {
        this.setState({
            cmd: evt.target.value,
        });
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    render() {
        const {onRefresh, onPin, onClose} = this.props;
        const line1 = (
            <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    ref="input"
                    value={this.state.cmd}
                    onChange={this.onChange.bind(this)}
                    onKeyPress={this.onKey.bind(this)}
                    placeholder="Command"
                />
                <IconBtn icon="refresh" onClick={onRefresh} />
                <IconBtn
                    icon="thumb-tack"
                    onClick={onPin}
                    title="Pin/unpin panel"
                />
                <IconBtn icon="close" onClick={onClose} />
            </div>
        );
        return (
            <div style={_l(styles.flex0)}>
                {line1}
            </div>
        );
    }

    input() {
        return this.state;
    }

    filter() {
        // TODO: no-op
    }

    onKey(evt) {
        if (evt.charCode == 13) {
            // Refresh
            this.props.onRefresh();
        }
    }

}


export class TaskPageInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            report: props.report || '',
            filter: props.filter || '',
        };
        this.onSearch = this.onSearch.bind(this);
    }

    onReportChange (evt) {
        this.setState({
            report: evt.target.value,
        });
    }

    onFilterChange (evt) {
        this.setState({
            filter: evt.target.value,
        });
    }

    componentDidMount() {
        this.refs.filter.addEventListener('search', this.onSearch);
    }

    componentWillUnmount() {
        this.refs.filter.removeEventListener('search', this.onSearch);
    }

    render() {
        const {onPin} = this.props;
        const line1 = (
            <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    value={this.state.report}
                    onChange={this.onReportChange.bind(this)}
                    onKeyPress={this.onKey.bind(this)}
                    placeholder="Report"
                />
                <IconBtn
                    icon="plus"
                    onClick={this.props.onAdd}
                    title="Add new"
                />
                <IconBtn icon="refresh" onClick={this.props.onRefresh} />
                <IconBtn
                    icon="thumb-tack"
                    onClick={onPin}
                    title="Pin/unpin panel"
                />
                <IconBtn icon="close" onClick={this.props.onClose} />
            </div>
        );
        const line2 = (
            <div style={_l(styles.flex0, styles.hflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="search"
                    ref="filter"
                    value={this.state.filter}
                    onChange={this.onFilterChange.bind(this)}
                    onKeyPress={this.onKey.bind(this)}
                    onSearch={this.onSearch.bind(this)}
                    placeholder="Filter"
                />
            </div>
        );

        return (
            <div style={_l(styles.flex0)}>
                {line1}
                {line2}
            </div>
        );
    }

    input() {
        return this.state;
    }

    onSearch(evt) {
        if (!this.state.filter) { // Empty
            this.props.onRefresh();
        };
    }

    onKey(evt) {
        if (evt.charCode == 13) {
            // Refresh
            this.props.onRefresh();
        }
    }

    filter(filter) {
        this.state.filter = filter;
        this.setState({
            filter: filter,
        });
    }

}
