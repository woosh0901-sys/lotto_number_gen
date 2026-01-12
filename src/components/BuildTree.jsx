import { getItemImageUrl } from '../hooks/useRiotApi';
import './BuildTree.css';

function TreeNode({ node, allItems }) {
    if (!node || !node.item) return null;

    const imageUrl = getItemImageUrl(node.item.image.full, node.item.version);

    return (
        <div className="tree-node">
            <div className="node-item">
                <img src={imageUrl} alt={node.item.name} title={node.item.name} />
                <span className="node-gold">{node.item.gold.total}g</span>
            </div>

            {node.children && node.children.length > 0 && (
                <>
                    <div className="tree-connector"></div>
                    <div className="node-children">
                        {node.children.map((child, index) => (
                            <TreeNode key={index} node={child} allItems={allItems} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export function BuildTree({ selectedItems, allItems, getBuildTree }) {
    if (!selectedItems.length || !allItems) {
        return (
            <div className="build-tree-container empty">
                <p>아이템을 선택하면 빌드 트리가 표시됩니다</p>
            </div>
        );
    }

    return (
        <div className="build-tree-container">
            <h3>📦 빌드 트리</h3>
            <div className="trees-wrapper">
                {selectedItems.map(itemId => {
                    const tree = getBuildTree(itemId);
                    return tree ? (
                        <div key={itemId} className="tree-root">
                            <TreeNode node={tree} allItems={allItems} />
                        </div>
                    ) : null;
                })}
            </div>
        </div>
    );
}
