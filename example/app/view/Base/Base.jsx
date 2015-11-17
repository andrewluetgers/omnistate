var React =         require('react'),
    Title =         require('react-document-title'),
    Link = 			require('react-router').Link,
    If =			require('../../common/If/If.jsx'),
    component = 	require('omnistate').component,
    Alpha =         require('../Alpha/Alpha.jsx');


module.exports = component("Base", {}, function() {
    return (
        <Title title='Home'>
            <div id="base">
                <Alpha />
            </div>
        </Title>
    );
});
