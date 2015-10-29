var React =         require('react'),
    Title =         require('react-document-title'),
    Link = 			require('react-router').Link,
    If =			require('../../common/If/If.jsx'),
    component = 	require('../../common/component/component');

module.exports = component("Base", {}, function() {
    return (
        <Title title='Home'>
            <div>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                Base
            </div>
        </Title>
    );
});
