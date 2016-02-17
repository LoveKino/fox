import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Record from '../components/Record';
import * as RecordActions from '../actions/record';

function mapStateToProps (state) {
    return {
        record : state.record
    };
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators(RecordActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Record);
